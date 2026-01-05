import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface VerticalLayoutProps {
  children: ReactNode;
  className?: string;
}

export function VerticalLayout({ children, className }: VerticalLayoutProps) {
  return (
    <div className={cn("w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6", className)}>
      {children}
    </div>
  );
}
