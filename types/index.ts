export interface Sticker {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: Date;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}

export interface GenerateRequest {
  prompt: string;
  referenceImage?: string; // base64 data URL, optional
}

export interface GenerateResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
}
