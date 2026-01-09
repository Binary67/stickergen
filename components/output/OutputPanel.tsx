"use client";

import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { StickerCard } from "./StickerCard";
import { Spinner } from "@/components/ui/Spinner";
import type { Sticker } from "@/types";

interface OutputPanelProps {
  sticker: Sticker | null;
  isGenerating: boolean;
  previewImage?: string | null;
  onDownload: (sticker: Sticker) => void;
}

export function OutputPanel({ sticker, isGenerating, previewImage, onDownload }: OutputPanelProps) {
  const isEmpty = !isGenerating && !sticker;

  return (
    <div
      className={`mt-6 rounded-[var(--radius-card)] min-h-[280px] flex items-center justify-center p-6 transition-all duration-200 ${
        isEmpty
          ? "border-2 border-dashed border-[var(--border)] bg-transparent"
          : "bg-[var(--bg-secondary)]"
      }`}
    >
      {isGenerating ? (
        previewImage ? (
          <div className="relative">
            <img
              src={previewImage}
              alt="Generating..."
              className="max-h-64 rounded-lg transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
              <Spinner className="h-8 w-8 text-white mb-3" />
              <span className="text-base text-white font-medium">
                Generating your sticker...
              </span>
            </div>
          </div>
        ) : (
          <LoadingState />
        )
      ) : sticker ? (
        <StickerCard sticker={sticker} onDownload={onDownload} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
