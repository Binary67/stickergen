export interface Sticker {
  id: string;
  imageUrl: string;
  prompt: string;
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
}

export interface GenerateResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
}
