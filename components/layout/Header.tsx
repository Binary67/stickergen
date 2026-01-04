import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="h-20 bg-[var(--bg-primary)]">
      <div className="h-full max-w-7xl mx-auto px-8 flex items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[var(--accent)]" />
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            StickerGen
          </h1>
        </div>
      </div>
    </header>
  );
}
