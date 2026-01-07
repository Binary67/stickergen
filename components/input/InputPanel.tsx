"use client";

import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PromptInput } from "./PromptInput";
import { CharacterSelector } from "./CharacterSelector";
import { Sparkles } from "lucide-react";
import type { OutputMode } from "@/types";

interface InputPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedCharacterId: string | null;
  onCharacterSelect: (id: string) => void;
  outputMode: OutputMode;
  onOutputModeChange: (mode: OutputMode) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  characterError: boolean;
}

const OUTPUT_MODE_OPTIONS: { value: OutputMode; label: string }[] = [
  { value: "sticker", label: "Sticker" },
  { value: "fullImage", label: "Full Image" },
];

export function InputPanel({
  prompt,
  onPromptChange,
  selectedCharacterId,
  onCharacterSelect,
  outputMode,
  onOutputModeChange,
  onGenerate,
  isGenerating,
  characterError,
}: InputPanelProps) {
  const canGenerate = prompt.trim().length > 0 && selectedCharacterId !== null && !isGenerating;
  const buttonText = outputMode === "sticker" ? "Generate Sticker" : "Generate Image";

  return (
    <div className="space-y-8">
      <CharacterSelector
        selectedCharacterId={selectedCharacterId}
        onSelect={onCharacterSelect}
        hasError={characterError}
      />

      <PromptInput
        value={prompt}
        onChange={onPromptChange}
      />

      <div>
        <label className="block text-sm font-normal text-[var(--text-secondary)] mb-4">
          Output
        </label>
        <SegmentedControl
          options={OUTPUT_MODE_OPTIONS}
          value={outputMode}
          onChange={onOutputModeChange}
        />
      </div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          loading={isGenerating}
          size="lg"
          className="px-8"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isGenerating ? "Generating..." : buttonText}
        </Button>
      </div>
    </div>
  );
}
