import { NextRequest, NextResponse } from "next/server";
import type { Character, CharactersConfig } from "@/types";
import charactersData from "@/public/characters/characters.json";

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

const KEY_BACKGROUND_COLOR_HEX = "#00FF00";

const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" }, 
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
];

// Cache for loaded images per character
const cachedImages: Map<string, string[]> = new Map();

// Use imported JSON directly (bundled with the serverless function)
const charactersConfig: CharactersConfig = charactersData as CharactersConfig;

function getBaseUrl(request: NextRequest): string {
  // Use VERCEL_URL if available (set automatically by Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback for local development
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

function findCharacterById(config: CharactersConfig, id: string): Character | undefined {
  return config.characters.find((c) => c.id === id);
}

function getMimeType(imagePath: string): string {
  const ext = imagePath.toLowerCase().split(".").pop();
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "image/png";
}

async function loadCharacterImages(baseUrl: string, character: Character): Promise<string[]> {
  const cached = cachedImages.get(character.id);
  if (cached) return cached;

  const images: string[] = [];

  for (const imagePath of character.images) {
    try {
      const response = await fetch(`${baseUrl}/${imagePath}`);
      if (!response.ok) {
        console.warn(`Failed to load image: ${imagePath} (${response.status})`);
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = getMimeType(imagePath);

      images.push(`data:${mimeType};base64,${base64}`);
    } catch (error) {
      console.warn(`Failed to load image: ${imagePath}`, error);
    }
  }

  cachedImages.set(character.id, images);
  return images;
}

function buildSystemPrompt(config: Character): string {
  return `You are a kawaii sticker illustrator. Create a single die-cut style character sticker based on the reference images and the user's description.

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

STICKER COMPOSITION:
- Focus on the character(s) only: no scenery, no background objects, no frames
- Center the character(s) with comfortable empty space around them (sticker padding)
- Keep the design bold, readable, and clean in chibi/kawaii style

BACKGROUND (IMPORTANT FOR POST-PROCESSING):
- Use a perfectly solid, flat background color: ${KEY_BACKGROUND_COLOR_HEX}
- No gradients, patterns, textures, shadows, vignettes, or lighting on the background
- Do NOT use ${KEY_BACKGROUND_COLOR_HEX} anywhere on the character(s), props, or outlines

CAPTION (OPTIONAL, CREATIVE):
- You may suggest a short caption ONLY if it strongly fits the user request and looks like a sticker caption
- Keep it 1–4 words, simple and punchy; otherwise set it to null
- Do NOT render any text in the image (text will be added later)
- Return ONLY valid JSON (no markdown) in your text response in this exact shape:
  {"caption": string | null, "captionPlacement": "bottom" | "top" | "bubble"}

OUTPUT:
- Generate exactly one image.`;
}

function parseCaptionSuggestion(content: string | undefined): {
  caption?: string;
  captionPlacement?: "bottom" | "top" | "bubble";
} {
  if (!content) return {};

  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return {};

  try {
    const parsed = JSON.parse(match[0]) as {
      caption?: unknown;
      captionPlacement?: unknown;
    };

    const caption =
      typeof parsed.caption === "string"
        ? parsed.caption.trim()
        : parsed.caption === null
          ? undefined
          : undefined;

    const captionPlacement =
      parsed.captionPlacement === "bottom" ||
      parsed.captionPlacement === "top" ||
      parsed.captionPlacement === "bubble"
        ? parsed.captionPlacement
        : undefined;

    return {
      caption: caption && caption.length > 0 ? caption : undefined,
      captionPlacement,
    };
  } catch {
    return {};
  }
}

async function coerceImageUrlToDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch generated image: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
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

    // Get base URL for fetching static assets (images)
    const baseUrl = getBaseUrl(request);

    // Find selected character from imported config
    const character = findCharacterById(charactersConfig, characterId);

    if (!character) {
      return NextResponse.json(
        { success: false, error: "Invalid character selected" },
        { status: 400 }
      );
    }

    const referenceImages = await loadCharacterImages(baseUrl, character);

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

    const imageUrl = await coerceImageUrlToDataUrl(images[0].image_url.url);
    const { caption, captionPlacement } = parseCaptionSuggestion(
      data.choices?.[0]?.message?.content
    );

    return NextResponse.json({
      imageUrl,
      caption,
      captionPlacement,
      keyBackgroundColor: KEY_BACKGROUND_COLOR_HEX,
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
