"use client";

import { Textarea } from "@/components/ui/Textarea";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function PromptInput({ value, onChange, maxLength = 500 }: PromptInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--text-primary)]">
        Describe your sticker
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="A cute cat wearing a party hat, cartoon style with thick outlines..."
        rows={4}
        maxLength={maxLength}
        autoResize
      />
      <div className="flex justify-end">
        <span className="text-xs text-[var(--text-secondary)]">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
