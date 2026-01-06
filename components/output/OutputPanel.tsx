"use client";

import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { StickerCard } from "./StickerCard";
import type { Sticker } from "@/types";

interface OutputPanelProps {
  sticker: Sticker | null;
  isGenerating: boolean;
  onDownload: (sticker: Sticker) => void;
}

export function OutputPanel({ sticker, isGenerating, onDownload }: OutputPanelProps) {
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
        <LoadingState />
      ) : sticker ? (
        <StickerCard sticker={sticker} onDownload={onDownload} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
