import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SplitViewProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}

export function SplitView({ left, right, className }: SplitViewProps) {
  return (
    <div className={cn("flex flex-col lg:flex-row min-h-[calc(100vh-80px)]", className)}>
      <div className="w-full lg:w-[45%]">
        {left}
      </div>
      <div className="w-full lg:w-[55%] bg-[var(--bg-secondary)]">
        {right}
      </div>
    </div>
  );
}
