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
          "rounded-[var(--radius-card)]",
          "overflow-hidden shadow-[var(--shadow)]",
          "transition-transform duration-200",
          "group-hover:scale-[1.02]"
        )}
      >
        <div className="checkered-bg">
          <img
            src={sticker.imageUrl}
            alt={sticker.prompt}
            className="block"
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
