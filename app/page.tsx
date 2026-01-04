"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { SplitView } from "@/components/layout/SplitView";
import { InputPanel } from "@/components/input/InputPanel";
import { OutputPanel } from "@/components/output/OutputPanel";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { Sticker, GenerateResponse } from "@/types";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    preview: referencePreview,
    fileName: referenceFileName,
    dimensions: referenceDimensions,
    error: referenceError,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    clearFile,
  } = useImageUpload();

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          referenceImage: referencePreview || undefined,
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
  }, [prompt, isGenerating]);

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
      <SplitView
        left={
          <InputPanel
            prompt={prompt}
            onPromptChange={setPrompt}
            referencePreview={referencePreview}
            referenceFileName={referenceFileName}
            referenceDimensions={referenceDimensions}
            referenceError={referenceError}
            onFileSelect={handleFileSelect}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClearReference={clearFile}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        }
        right={
          <OutputPanel
            sticker={sticker}
            isGenerating={isGenerating}
            onDownload={handleDownload}
          />
        }
      />
    </div>
  );
}
