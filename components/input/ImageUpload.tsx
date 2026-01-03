"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  preview: string | null;
  error: string | null;
  onFileSelect: (file: File | null) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClear: () => void;
}

export function ImageUpload({
  preview,
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
      <label className="block text-sm font-medium text-[var(--text-primary)]">
        Reference image <span className="text-[var(--text-secondary)] font-normal">(optional)</span>
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)]">
          <img
            src={preview}
            alt="Reference preview"
            className="w-full h-40 object-cover"
          />
          <button
            onClick={onClear}
            className={cn(
              "absolute top-2 right-2",
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
            "h-40 rounded-[var(--radius-card)]",
            "border-2 border-dashed",
            "flex flex-col items-center justify-center gap-2",
            "cursor-pointer transition-all duration-200",
            isDragging
              ? "border-[var(--accent)] bg-[var(--accent)]/5"
              : "border-[var(--border)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
            {isDragging ? (
              <ImageIcon className="w-5 h-5 text-[var(--accent)]" />
            ) : (
              <Upload className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-[var(--text-primary)]">
              {isDragging ? "Drop image here" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
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
