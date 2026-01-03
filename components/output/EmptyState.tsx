import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--bg-primary)] flex items-center justify-center mb-4 shadow-[var(--shadow)]">
        <Sparkles className="w-8 h-8 text-[var(--text-secondary)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
        No sticker yet
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs">
        Describe your sticker idea and click generate to create your custom sticker
      </p>
    </div>
  );
}
