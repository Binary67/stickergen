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
          "w-full px-4 py-4 text-base",
          "bg-[var(--bg-secondary)] text-[var(--text-primary)]",
          "border border-transparent rounded-[var(--radius-card)]",
          "placeholder:text-[var(--text-secondary)]",
          "focus:outline-none focus:bg-[var(--bg-primary)] focus:border-[var(--border)]",
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
