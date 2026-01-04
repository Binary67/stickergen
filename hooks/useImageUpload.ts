"use client";

import { useState, useCallback } from "react";

interface ImageDimensions {
  width: number;
  height: number;
}

interface UseImageUploadReturn {
  file: File | null;
  preview: string | null;
  fileName: string | null;
  dimensions: ImageDimensions | null;
  error: string | null;
  handleFileSelect: (file: File | null) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  clearFile: () => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function useImageUpload(): UseImageUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please upload a JPEG, PNG, or WebP image";
    }
    if (file.size > MAX_SIZE) {
      return "Image must be less than 10MB";
    }
    return null;
  }, []);

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    setError(null);

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      setFileName(null);
      setDimensions(null);
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);

    // Create preview URL and extract dimensions
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);

      // Extract image dimensions
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(selectedFile);
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setFileName(null);
    setDimensions(null);
    setError(null);
  }, []);

  return {
    file,
    preview,
    fileName,
    dimensions,
    error,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    clearFile,
  };
}
