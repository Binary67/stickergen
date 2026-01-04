"use client";

import { Button } from "@/components/ui/Button";
import { PromptInput } from "./PromptInput";
import { ImageUpload } from "./ImageUpload";
import { Sparkles } from "lucide-react";

interface ImageDimensions {
  width: number;
  height: number;
}

interface InputPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  referencePreview: string | null;
  referenceFileName: string | null;
  referenceDimensions: ImageDimensions | null;
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
  referenceFileName,
  referenceDimensions,
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
    <div className="h-full flex flex-col p-8 lg:p-10">
      <div className="flex-1 space-y-8">
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
        />

        <ImageUpload
          preview={referencePreview}
          fileName={referenceFileName}
          dimensions={referenceDimensions}
          error={referenceError}
          onFileSelect={onFileSelect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClear={onClearReference}
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
