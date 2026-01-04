"use client";

import { Button } from "@/components/ui/Button";
import { PromptInput } from "./PromptInput";
import { CharacterDisplay } from "./CharacterDisplay";
import { Sparkles } from "lucide-react";

interface InputPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function InputPanel({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
}: InputPanelProps) {
  const canGenerate = prompt.trim().length > 0 && !isGenerating;

  return (
    <div className="h-full flex flex-col p-8 lg:p-10">
      <div className="flex-1 space-y-8">
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
        />

        <CharacterDisplay />
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
