export type OutputMode = 'sticker' | 'fullImage';

export interface Sticker {
  id: string;
  imageUrl: string;
  prompt: string;
  caption?: string;
  createdAt: Date;
}

export interface Character {
  id: string;
  name: string;
  icon: string;
  description: string;
  images: string[];
  identityPrompt: string;
}

export interface CharactersConfig {
  characters: Character[];
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}

export interface GenerateRequest {
  prompt: string;
  characterId: string;
  outputMode: OutputMode;
}

export interface GenerateResponse {
  imageUrl: string;
  success: boolean;
  caption?: string;
  captionPlacement?: "bottom" | "top" | "bubble";
  keyBackgroundColor?: string;
  outputMode?: OutputMode;
  error?: string;
}
