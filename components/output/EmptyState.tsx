import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-4">
      <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-[var(--text-secondary)]/50" />
      </div>
      <p className="text-sm text-[var(--text-secondary)]/70">
        Your sticker will appear here
      </p>
    </div>
  );
}
