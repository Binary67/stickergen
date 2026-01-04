import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Character, CharactersConfig } from "@/types";

interface OpenRouterImageResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
      images?: Array<{
        type: string;
        image_url: {
          url: string;
        };
      }>;
    };
    finish_reason?: string;
  }>;
  error?: {
    message: string;
  };
  promptFeedback?: {
    blockReason?: string;
  };
}

const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
];

// Cache for characters config and images per character
let cachedCharacters: CharactersConfig | null = null;
const cachedImages: Map<string, string[]> = new Map();

async function loadCharactersConfig(): Promise<CharactersConfig> {
  if (cachedCharacters) return cachedCharacters;

  const configPath = path.join(process.cwd(), "public", "characters", "characters.json");
  const configContent = await fs.readFile(configPath, "utf-8");
  cachedCharacters = JSON.parse(configContent) as CharactersConfig;
  return cachedCharacters;
}

function findCharacterById(config: CharactersConfig, id: string): Character | undefined {
  return config.characters.find((c) => c.id === id);
}

async function loadCharacterImages(character: Character): Promise<string[]> {
  const cached = cachedImages.get(character.id);
  if (cached) return cached;

  const images: string[] = [];

  for (const imagePath of character.images) {
    try {
      const fullPath = path.join(process.cwd(), "public", imagePath);
      const imageBuffer = await fs.readFile(fullPath);
      const base64 = imageBuffer.toString("base64");

      // Determine MIME type from extension
      const ext = path.extname(imagePath).toLowerCase();
      const mimeType =
        ext === ".png" ? "image/png" :
        ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
        ext === ".webp" ? "image/webp" :
        "image/png";

      images.push(`data:${mimeType};base64,${base64}`);
    } catch (error) {
      console.warn(`Failed to load image: ${imagePath}`, error);
    }
  }

  cachedImages.set(character.id, images);
  return images;
}

function buildSystemPrompt(config: Character): string {
  return `You are a kawaii illustration artist. Generate a single cute character illustration based on the reference images and user's description.

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
- The characters should perform what the user describes, not what they're doing in the references

IMAGE REQUIREMENTS:
- Generate ONE unified scene, NOT split panels or multiple frames
- IMPORTANT: The background MUST fill the ENTIRE square canvas edge-to-edge, including all four corners
- Use solid colors, soft pastels, or gradients for the background - no transparency anywhere
- Do NOT create rounded corners, soft edges, or fade-outs at the edges
- The image must be a complete rectangle with color reaching every pixel of the frame
- Use bold outlines and vibrant colors in chibi/kawaii style
- The characters should be centered within the scene
- No text unless specifically requested`;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, characterId } = await request.json();

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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      );
    }

    // Load characters configuration and find selected character
    const charactersConfig = await loadCharactersConfig();
    const character = findCharacterById(charactersConfig, characterId);

    if (!character) {
      return NextResponse.json(
        { success: false, error: "Invalid character selected" },
        { status: 400 }
      );
    }

    const referenceImages = await loadCharacterImages(character);

    if (referenceImages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No character reference images found" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(character);
    const fullPromptText = `${systemPrompt}\n\nUser request: ${prompt}`;

    // Build multimodal message content with all reference images
    type MessageContent = Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

    const messageContent: MessageContent = [
      { type: "text", text: fullPromptText },
      ...referenceImages.map((imageUrl) => ({
        type: "image_url" as const,
        image_url: { url: imageUrl },
      })),
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [{ role: "user", content: messageContent }],
          modalities: ["image", "text"],
          image_config: {
            aspect_ratio: "1:1",
          },
          safety_settings: SAFETY_SETTINGS,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json(
        { success: false, error: "Image generation failed" },
        { status: response.status }
      );
    }

    const data: OpenRouterImageResponse = await response.json();

    if (data.error) {
      return NextResponse.json(
        { success: false, error: data.error.message },
        { status: 500 }
      );
    }

    const images = data.choices?.[0]?.message?.images;
    if (!images || images.length === 0) {
      const finishReason = data.choices?.[0]?.finish_reason;
      const blockReason = data.promptFeedback?.blockReason;

      let errorMessage = "No image generated";

      if (finishReason === "SAFETY" || blockReason) {
        errorMessage = `Content blocked by safety filters${blockReason ? `: ${blockReason}` : ""}`;
      } else if (finishReason === "RECITATION") {
        errorMessage = "Content blocked due to copyright/recitation policy";
      } else if (finishReason && finishReason !== "STOP") {
        errorMessage = `Generation stopped: ${finishReason}`;
      }

      console.error("Image generation blocked:", { finishReason, blockReason });

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }

    const imageUrl = images[0].image_url.url;

    return NextResponse.json({
      imageUrl,
      success: true,
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
