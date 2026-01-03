"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sticker } from "@/types";

interface StickerCardProps {
  sticker: Sticker;
  onDownload: (sticker: Sticker) => void;
}

export function StickerCard({ sticker, onDownload }: StickerCardProps) {
  return (
    <div className="group relative">
      <div
        className={cn(
          "w-64 h-64 rounded-[var(--radius-card)]",
          "overflow-hidden shadow-[var(--shadow)]",
          "transition-transform duration-200",
          "group-hover:scale-[1.02]"
        )}
      >
        <div className="checkered-bg w-full h-full flex items-center justify-center p-4">
          <img
            src={sticker.imageUrl}
            alt={sticker.prompt}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>

      <button
        onClick={() => onDownload(sticker)}
        className={cn(
          "absolute bottom-3 right-3",
          "w-10 h-10 rounded-full",
          "bg-[var(--accent)] hover:bg-[var(--accent-hover)]",
          "flex items-center justify-center",
          "text-white shadow-lg",
          "opacity-0 group-hover:opacity-100",
          "transition-all duration-200",
          "transform translate-y-1 group-hover:translate-y-0"
        )}
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
}
