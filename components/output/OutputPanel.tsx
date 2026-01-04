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
    <div className="h-full min-h-[400px] lg:min-h-0 flex items-center justify-center p-8">
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
