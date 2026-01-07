"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { VerticalLayout } from "@/components/layout/VerticalLayout";
import { InputPanel } from "@/components/input/InputPanel";
import { OutputPanel } from "@/components/output/OutputPanel";
import { createDieCutSticker } from "@/lib/dieCutSticker";
import type { Sticker, StreamingEvent, OutputMode } from "@/types";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [characterError, setCharacterError] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>("sticker");

  const handleCharacterSelect = useCallback((id: string) => {
    setSelectedCharacterId(id);
    setCharacterError(false);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedCharacterId) {
      setCharacterError(true);
      return;
    }

    if (!prompt.trim() || isGenerating) return;

    setCharacterError(false);
    setIsGenerating(true);
    setPreviewImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          characterId: selectedCharacterId,
          outputMode,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const event: StreamingEvent = JSON.parse(line.slice(6));

            if (event.type === "partial" && event.image) {
              setPreviewImage(event.image);
            } else if (event.type === "final" && event.image) {
              // Process final image
              const finalImageUrl =
                outputMode === "sticker"
                  ? await createDieCutSticker({
                      sourceImageUrl: event.image,
                      keyBackgroundColor: event.keyBackgroundColor,
                    })
                  : event.image;

              setSticker({
                id: Date.now().toString(),
                imageUrl: finalImageUrl,
                prompt: prompt.trim(),
                createdAt: new Date(),
              });
              setPreviewImage(null);
            } else if (event.type === "error") {
              throw new Error(event.error || "Generation failed");
            }
          } catch (parseError) {
            console.error("Error parsing SSE event:", parseError);
          }
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
      setPreviewImage(null);
    }
  }, [prompt, selectedCharacterId, isGenerating, outputMode]);

  const handleDownload = useCallback((stickerToDownload: Sticker) => {
    const link = document.createElement("a");
    link.href = stickerToDownload.imageUrl;
    link.download = `sticker-${stickerToDownload.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <VerticalLayout>
        <InputPanel
          prompt={prompt}
          onPromptChange={setPrompt}
          selectedCharacterId={selectedCharacterId}
          onCharacterSelect={handleCharacterSelect}
          outputMode={outputMode}
          onOutputModeChange={setOutputMode}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          characterError={characterError}
        />
        <OutputPanel
          sticker={sticker}
          isGenerating={isGenerating}
          previewImage={previewImage}
          onDownload={handleDownload}
        />
      </VerticalLayout>
    </div>
  );
}
