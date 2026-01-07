import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "openai";
import type { Character, CharactersConfig, OutputMode } from "@/types";
import charactersData from "@/public/characters/characters.json";
import { characterImages } from "@/lib/character-images.generated";
import { config } from "dotenv";

// Load environment variables from .env.local (override system env vars)
config({ path: ".env.local", override: true });

const KEY_BACKGROUND_COLOR_HEX = "#00FF00";

// Azure OpenAI API configuration
const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2025-04-01-preview";

/**
 * Create an Azure OpenAI client
 */
function getAzureClient(endpoint: string, apiKey: string, deploymentName: string): AzureOpenAI {
  // Extract base URL if full URL is provided
  const urlMatch = endpoint.match(/^(https:\/\/[^\/]+)/);
  const baseUrl = urlMatch ? urlMatch[1] : endpoint;

  return new AzureOpenAI({
    endpoint: baseUrl,
    apiKey,
    apiVersion: AZURE_API_VERSION,
    deployment: deploymentName,
  });
}

/**
 * Convert a base64 data URL to a File for SDK upload
 */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64Data] = dataUrl.split(",");
  const mimeMatch = header.match(/data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mimeType });
}

// Use imported JSON directly (bundled with the serverless function)
const charactersConfig: CharactersConfig = charactersData as CharactersConfig;

function findCharacterById(config: CharactersConfig, id: string): Character | undefined {
  return config.characters.find((c) => c.id === id);
}

function buildSystemPrompt(config: Character, outputMode: OutputMode): string {
  const basePrompt = `You are a kawaii illustration artist. Create an image featuring the character(s) based on the reference images and the user's description.

${config.identityPrompt}

CHARACTER DESCRIPTION:
${config.description}

CHARACTER IDENTITY (PRESERVE THESE):
- Face, body shape, and proportions exactly as shown in reference images
- Colors, clothing, and distinctive visual features
- Overall art style and character design

ACTION/POSE (DO NOT COPY FROM REFERENCE):
- Ignore the pose, gesture, or action shown in the reference images
- Use the pose/action described in the user's prompt instead
- The characters should perform what the user describes, not what they're doing in the references`;

  if (outputMode === "sticker") {
    return `${basePrompt}

STICKER COMPOSITION:
- Focus on the character(s) only: no scenery, no background objects, no frames
- Center the character(s) with comfortable empty space around them (sticker padding)
- Keep the design bold, readable, and clean in chibi/kawaii style

BACKGROUND (IMPORTANT FOR POST-PROCESSING):
- Use a perfectly solid, flat background color: ${KEY_BACKGROUND_COLOR_HEX}
- No gradients, patterns, textures, shadows, vignettes, or lighting on the background
- Do NOT use ${KEY_BACKGROUND_COLOR_HEX} anywhere on the character(s), props, or outlines

OUTPUT:
- Generate exactly one image
- Do NOT render any text in the image`;
  }

  // Full image mode
  return `${basePrompt}

SCENE COMPOSITION:
- Generate a complete scene with an appropriate background based on the user's prompt
- The background should be kawaii/cute style matching the character aesthetic
- Include relevant environmental details that complement the scene
- The character(s) should be naturally integrated into the scene

OUTPUT:
- Generate exactly one image
- Do NOT render any text in the image`;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, characterId, outputMode = "sticker" } = await request.json() as {
      prompt: string;
      characterId: string;
      outputMode?: OutputMode;
    };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!characterId || typeof characterId !== "string") {
      return NextResponse.json(
        { success: false, error: "Character selection is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-image-1.5";

    if (!apiKey || !azureEndpoint) {
      return NextResponse.json(
        { success: false, error: "Azure OpenAI API not configured" },
        { status: 500 }
      );
    }

    // Find selected character from imported config
    const character = findCharacterById(charactersConfig, characterId);

    if (!character) {
      return NextResponse.json(
        { success: false, error: "Invalid character selected" },
        { status: 400 }
      );
    }

    const referenceImages = characterImages[character.id] || [];

    if (referenceImages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No character reference images found" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(character, outputMode);
    const fullPromptText = `${systemPrompt}\n\nUser request: ${prompt}`;

    // Convert reference images to File objects for SDK
    const imageFiles = referenceImages.map((img, i) =>
      dataUrlToFile(img, `reference_${i}.png`)
    );

    // Create Azure OpenAI client
    const client = getAzureClient(azureEndpoint, apiKey, deploymentName);

    // Call images.edit() with reference images
    const result = await client.images.edit({
      image: imageFiles,
      prompt: fullPromptText,
      n: 1,
      size: "1024x1024",
      model: deploymentName,
      quality: "high",
      input_fidelity: "high",
    });

    if (!result.data || result.data.length === 0) {
      console.error("No image data in response");
      return NextResponse.json(
        { success: false, error: "No image generated" },
        { status: 500 }
      );
    }

    // SDK returns b64_json in the data array
    const base64Image = result.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({
      imageUrl,
      success: true,
      outputMode,
      // Only include keyBackgroundColor for sticker mode (needed for post-processing)
      ...(outputMode === "sticker" && { keyBackgroundColor: KEY_BACKGROUND_COLOR_HEX }),
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 }
    );
  }
}
