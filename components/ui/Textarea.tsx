import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea && autoResize) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        adjustHeight();
      }
      onChange?.(e);
    };

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          "w-full px-4 py-3 text-base",
          "bg-[var(--bg-primary)] text-[var(--text-primary)]",
          "border border-[var(--border)] rounded-[var(--radius-card)]",
          "placeholder:text-[var(--text-secondary)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent",
          "transition-all duration-200",
          "resize-none",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
