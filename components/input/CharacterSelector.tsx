"use client";

import { AlertCircle, Users } from "lucide-react";
import { useState, useEffect } from "react";
import type { Character, CharactersConfig } from "@/types";

interface CharacterSelectorProps {
  selectedCharacterId: string | null;
  onSelect: (characterId: string) => void;
  hasError: boolean;
}

export function CharacterSelector({
  selectedCharacterId,
  onSelect,
  hasError,
}: CharacterSelectorProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/characters/characters.json")
      .then((res) => res.json())
      .then((data: CharactersConfig) => setCharacters(data.characters))
      .catch(() => setCharacters([]));
  }, []);

  const handleImageError = (characterId: string) => {
    setImageErrors((prev) => new Set(prev).add(characterId));
  };

  const showError = hasError && !selectedCharacterId;

  return (
    <div className="space-y-2">
      <label className="text-sm font-normal text-[var(--text-secondary)]">
        Characters <span className="text-red-500">*</span>
      </label>

      <div
        className={`p-4 rounded-[var(--radius-card)] border transition-colors duration-200 ${
          showError
            ? "border-red-500 bg-red-50"
            : "border-[var(--border)] bg-[var(--bg-secondary)]"
        }`}
      >
        {characters.length === 0 ? (
          <div className="text-sm text-[var(--text-secondary)]">Loading...</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {characters.map((character) => {
              const isSelected = selectedCharacterId === character.id;
              const iconPath = `/${character.icon}`;
              const hasImageError = imageErrors.has(character.id);

              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => onSelect(character.id)}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer min-w-[100px] ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-transparent bg-white hover:border-[var(--accent)]/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--accent)]/10 flex items-center justify-center mb-2">
                    {hasImageError ? (
                      <Users className="w-6 h-6 text-[var(--accent)]" />
                    ) : (
                      <img
                        src={iconPath}
                        alt={character.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(character.id)}
                      />
                    )}
                  </div>
                  <p className="text-xs font-medium text-[var(--text-primary)] text-center whitespace-nowrap">
                    {character.name}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showError && (
        <p className="text-sm text-red-500 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          Please select a character
        </p>
      )}
    </div>
  );
}
