import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a sticker designer. Generate a single sticker image based on the user's description.
IMPORTANT REQUIREMENTS:
- The sticker MUST have a transparent background
- Use bold outlines and vibrant colors suitable for stickers
- The design should be centered and self-contained
- No text unless specifically requested
- Cartoon/illustration style`;

const SYSTEM_PROMPT_WITH_REFERENCE = `You are a sticker designer. Generate a single sticker image based on the reference image and user's description.
IMPORTANT REQUIREMENTS:
- PRESERVE the character, subject, or main element from the reference image
- Maintain the character's appearance, colors, and distinctive features
- The sticker MUST have a transparent background
- Use bold outlines and vibrant colors suitable for stickers
- The design should be centered and self-contained
- No text unless specifically requested
- Apply the user's prompt as modifications or context to the reference subject`;

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

export async function POST(request: NextRequest) {
  try {
    const { prompt, referenceImage } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Validate reference image format if provided
    if (referenceImage && !referenceImage.startsWith("data:image/")) {
      return NextResponse.json(
        { success: false, error: "Invalid reference image format" },
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

    // Use reference-aware prompt when image is provided
    const systemPrompt = referenceImage
      ? SYSTEM_PROMPT_WITH_REFERENCE
      : SYSTEM_PROMPT;
    const fullPromptText = `${systemPrompt}\n\nUser request: ${prompt}\n\nGenerate a sticker with transparent background.`;

    // Build message content - array for multimodal, string for text-only
    type MessageContent =
      | string
      | Array<
          | { type: "text"; text: string }
          | { type: "image_url"; image_url: { url: string } }
        >;

    const messageContent: MessageContent = referenceImage
      ? [
          { type: "text", text: fullPromptText },
          { type: "image_url", image_url: { url: referenceImage } },
        ]
      : fullPromptText;

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
      // Check for content blocking reasons
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
