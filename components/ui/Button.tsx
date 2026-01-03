import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:scale-[0.98]":
              variant === "primary",
            "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--border)]":
              variant === "secondary",
            "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]":
              variant === "ghost",
          },
          {
            "h-8 px-3 text-sm rounded-md": size === "sm",
            "h-10 px-4 text-sm rounded-[var(--radius-button)]": size === "md",
            "h-12 px-6 text-base rounded-[var(--radius-button)]": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && <Spinner className="w-4 h-4 mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
