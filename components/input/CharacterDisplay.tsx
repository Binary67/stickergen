"use client";

import { Users } from "lucide-react";
import { useState, useEffect } from "react";

interface CharacterConfig {
  name: string;
  icon: string;
  description: string;
  images: string[];
  identityPrompt: string;
}

export function CharacterDisplay() {
  const [config, setConfig] = useState<CharacterConfig | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetch("/characters/characters.json")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(null));
  }, []);

  const iconPath = config?.icon ? `/${config.icon}` : null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-normal text-[var(--text-secondary)]">
        Characters
      </label>

      <div className="flex items-center gap-4 p-4 rounded-[var(--radius-card)] bg-[var(--bg-secondary)] border border-[var(--border)]">
        <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-[var(--accent)]/10 flex items-center justify-center">
          {!iconPath || imageError ? (
            <Users className="w-6 h-6 text-[var(--accent)]" />
          ) : (
            <img
              src={iconPath}
              alt={config?.name || "Characters"}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {config?.name || "Loading..."}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {config ? `${config.images.length} reference images` : "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
}
