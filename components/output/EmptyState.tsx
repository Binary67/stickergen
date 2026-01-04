import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] flex items-center justify-center mb-4">
        <Sparkles className="w-5 h-5 text-[var(--text-secondary)]" />
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        Your sticker will appear here
      </p>
    </div>
  );
}
