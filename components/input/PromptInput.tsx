"use client";

import { Textarea } from "@/components/ui/Textarea";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function PromptInput({ value, onChange, maxLength = 500 }: PromptInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-normal text-[var(--text-secondary)]">
          Describe your sticker
        </label>
        <span className="text-xs text-[var(--text-secondary)]/60 tabular-nums">
          {value.length}/{maxLength}
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="A cute cat wearing a party hat, cartoon style with thick outlines..."
        rows={4}
        maxLength={maxLength}
        autoResize
      />
    </div>
  );
}
