"use client";

import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { StickerCard } from "./StickerCard";
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
              className="max-h-64 rounded-lg opacity-80 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-[var(--text-secondary)] bg-white/80 px-3 py-1 rounded-full">
                Generating...
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
