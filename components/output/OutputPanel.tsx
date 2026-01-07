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
              className="max-h-64 rounded-lg transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
              <svg
                className="animate-spin h-8 w-8 text-white mb-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
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
