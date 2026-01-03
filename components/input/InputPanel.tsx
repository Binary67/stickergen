"use client";

import { Button } from "@/components/ui/Button";
import { PromptInput } from "./PromptInput";
import { ImageUpload } from "./ImageUpload";
import { Sparkles } from "lucide-react";

interface InputPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  referencePreview: string | null;
  referenceError: string | null;
  onFileSelect: (file: File | null) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClearReference: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function InputPanel({
  prompt,
  onPromptChange,
  referencePreview,
  referenceError,
  onFileSelect,
  onDrop,
  onDragOver,
  onClearReference,
  onGenerate,
  isGenerating,
}: InputPanelProps) {
  const canGenerate = prompt.trim().length > 0 && !isGenerating;

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="flex-1 space-y-6">
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
        />

        <ImageUpload
          preview={referencePreview}
          error={referenceError}
          onFileSelect={onFileSelect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClear={onClearReference}
        />
      </div>

      <div className="pt-6 mt-auto">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          loading={isGenerating}
          size="lg"
          className="w-full"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isGenerating ? "Generating..." : "Generate Sticker"}
        </Button>
      </div>
    </div>
  );
}
