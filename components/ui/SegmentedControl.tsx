"use client";

import { cn } from "@/lib/utils";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex p-1 rounded-[var(--radius-button)] bg-[var(--bg-secondary)]",
        className
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-[calc(var(--radius-button)-2px)] transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
              isSelected
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
