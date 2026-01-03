export function LoadingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-64 h-64 rounded-[var(--radius-card)] bg-[var(--bg-primary)] shadow-[var(--shadow)] overflow-hidden">
        <div className="w-full h-full animate-pulse bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--border)] to-[var(--bg-secondary)] bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </div>
      <p className="mt-4 text-sm text-[var(--text-secondary)]">
        Creating your sticker...
      </p>
    </div>
  );
}
