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
}

export interface GenerateResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
}
