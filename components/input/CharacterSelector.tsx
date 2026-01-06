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
        Characters <span className="text-[var(--text-secondary)]/60">*</span>
      </label>

      <div
        className={`p-5 rounded-[var(--radius-card)] transition-all duration-200 ${
          showError
            ? "ring-2 ring-red-500 bg-red-50"
            : "bg-white shadow-[var(--shadow-card)]"
        }`}
      >
        {characters.length === 0 ? (
          <div className="text-sm text-[var(--text-secondary)]">Loading...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {characters.map((character) => {
              const isSelected = selectedCharacterId === character.id;
              const iconPath = `/${character.icon}`;
              const hasImageError = imageErrors.has(character.id);

              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => onSelect(character.id)}
                  className={`flex-shrink-0 flex flex-col items-center p-4 rounded-xl transition-all duration-200 cursor-pointer min-w-[110px] ${
                    isSelected
                      ? "bg-[var(--accent)]/8 ring-2 ring-[var(--accent)] shadow-sm"
                      : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 hover:scale-105 hover:shadow-sm"
                  }`}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-white flex items-center justify-center mb-2 shadow-sm">
                    {hasImageError ? (
                      <Users className="w-7 h-7 text-[var(--accent)]" />
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
