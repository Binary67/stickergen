"use client";

import { Button } from "@/components/ui/Button";
import { PromptInput } from "./PromptInput";
import { CharacterSelector } from "./CharacterSelector";
import { Sparkles } from "lucide-react";

interface InputPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedCharacterId: string | null;
  onCharacterSelect: (id: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  characterError: boolean;
}

export function InputPanel({
  prompt,
  onPromptChange,
  selectedCharacterId,
  onCharacterSelect,
  onGenerate,
  isGenerating,
  characterError,
}: InputPanelProps) {
  const canGenerate = prompt.trim().length > 0 && selectedCharacterId !== null && !isGenerating;

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

      <div className="flex justify-center pt-2">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          loading={isGenerating}
          size="lg"
          className="px-8"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isGenerating ? "Generating..." : "Generate Sticker"}
        </Button>
      </div>
    </div>
  );
}
