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
  return (
    <div className="mt-6 rounded-[var(--radius-card)] bg-[var(--bg-secondary)] min-h-[300px] flex items-center justify-center p-6">
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
