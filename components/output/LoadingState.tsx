import { Spinner } from "@/components/ui/Spinner";

export function LoadingState() {
  return (
    <div className="relative">
      <div className="w-64 h-64 rounded-lg bg-[var(--bg-secondary)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
        <Spinner className="h-8 w-8 text-white mb-3" />
        <span className="text-base text-white font-medium">
          Generating your sticker...
        </span>
      </div>
    </div>
  );
}
