"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageUploadProps {
  preview: string | null;
  fileName: string | null;
  dimensions: ImageDimensions | null;
  error: string | null;
  onFileSelect: (file: File | null) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClear: () => void;
}

export function ImageUpload({
  preview,
  fileName,
  dimensions,
  error,
  onFileSelect,
  onDrop,
  onDragOver,
  onClear,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDropInternal = (e: React.DragEvent) => {
    setIsDragging(false);
    onDrop(e);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-normal text-[var(--text-secondary)]">
        Reference image <span className="opacity-60">(optional)</span>
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="flex items-center gap-4 p-3 rounded-[var(--radius-card)] bg-[var(--bg-secondary)] border border-[var(--border)]">
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-[var(--border)] bg-white">
            <img
              src={preview}
              alt="Reference preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-primary)] truncate">
              {fileName || "Reference image"}
            </p>
            {dimensions && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {dimensions.width} × {dimensions.height}
              </p>
            )}
          </div>
          <button
            onClick={onClear}
            className={cn(
              "flex-shrink-0",
              "w-8 h-8 rounded-full",
              "bg-black/50 hover:bg-black/70",
              "flex items-center justify-center",
              "text-white transition-colors duration-200"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDropInternal}
          onDragOver={onDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={cn(
            "h-36 rounded-[var(--radius-card)]",
            "flex flex-col items-center justify-center gap-3",
            "cursor-pointer transition-all duration-200",
            isDragging
              ? "bg-[var(--accent)]/5 ring-2 ring-[var(--accent)]"
              : "bg-[var(--bg-secondary)] hover:bg-[#ECECF0]"
          )}
        >
          {isDragging ? (
            <ImageIcon className="w-6 h-6 text-[var(--accent)]" />
          ) : (
            <Upload className="w-6 h-6 text-[var(--text-secondary)]" />
          )}
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              {isDragging ? "Drop image here" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-[var(--text-secondary)] opacity-60 mt-1">
              JPEG, PNG, WebP up to 10MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
