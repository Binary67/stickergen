"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { VerticalLayout } from "@/components/layout/VerticalLayout";
import { InputPanel } from "@/components/input/InputPanel";
import { OutputPanel } from "@/components/output/OutputPanel";
import type { Sticker, GenerateResponse } from "@/types";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [characterError, setCharacterError] = useState(false);

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

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          characterId: selectedCharacterId,
        }),
      });

      const data: GenerateResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Generation failed");
      }

      const newSticker: Sticker = {
        id: Date.now().toString(),
        imageUrl: data.imageUrl,
        prompt: prompt.trim(),
        createdAt: new Date(),
      };

      setSticker(newSticker);
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedCharacterId, isGenerating]);

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
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          characterError={characterError}
        />
        <OutputPanel
          sticker={sticker}
          isGenerating={isGenerating}
          onDownload={handleDownload}
        />
      </VerticalLayout>
    </div>
  );
}
