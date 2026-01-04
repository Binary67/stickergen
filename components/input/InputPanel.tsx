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
    <div className="h-full flex flex-col p-8 lg:p-10">
      <div className="flex-1 space-y-8">
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
        />

        <CharacterSelector
          selectedCharacterId={selectedCharacterId}
          onSelect={onCharacterSelect}
          hasError={characterError}
        />
      </div>

      <div className="pt-8 mt-auto flex justify-center">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          loading={isGenerating}
          size="lg"
          className="px-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isGenerating ? "Generating..." : "Generate Sticker"}
        </Button>
      </div>
    </div>
  );
}
