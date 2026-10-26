"use client";

import type { ChangeEvent } from "react";

import { cn } from "@/lib/utils";

export function Switch({
  id,
  checked,
  disabled = false,
  onCheckedChange,
  className,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onCheckedChange(event.target.checked);
  }

  return (
    <label className={cn("relative inline-flex shrink-0 cursor-pointer", className)}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex h-5 w-9 items-center rounded-full bg-input",
          "peer-checked:bg-primary",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
          "peer-disabled:opacity-50",
        )}
      >
        <span
          className={cn(
            "block size-4 translate-x-0.5 rounded-full bg-background shadow-sm",
            checked && "translate-x-4",
          )}
        />
      </span>
    </label>
  );
}
