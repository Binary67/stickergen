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
    <div className="h-full min-h-[400px] lg:min-h-0 flex flex-col">
      <div className="p-6 lg:p-8 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Generated Sticker
        </h2>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {isGenerating ? (
          <LoadingState />
        ) : sticker ? (
          <StickerCard sticker={sticker} onDownload={onDownload} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
