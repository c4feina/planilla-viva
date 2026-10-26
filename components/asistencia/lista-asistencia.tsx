"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import type { CursadaConAlumno } from "@/lib/academic";
import { cn } from "@/lib/utils";

export function ListaAsistencia({
  rows,
  presence,
  disabled,
  onToggle,
}: {
  rows: readonly CursadaConAlumno[];
  presence: Readonly<Record<string, boolean>>;
  disabled: boolean;
  onToggle: (cursadaId: string) => void;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-md border border-border bg-background",
        disabled && "opacity-50",
      )}
    >
      {rows.map(({ cursada, alumno }) => {
        const present = presence[cursada.id] === true;

        return (
          <CheckboxPrimitive.Root
            key={cursada.id}
            checked={present}
            disabled={disabled}
            onCheckedChange={() => onToggle(cursada.id)}
            aria-label={`${alumno.apellido}, ${alumno.nombre}`}
            className={cn(
              "flex h-14 w-full items-center justify-between gap-4 px-3 text-left outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              "disabled:cursor-not-allowed",
              present
                ? "bg-emerald-50/60 dark:bg-emerald-950/40"
                : "bg-background",
            )}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {alumno.apellido}, {alumno.nombre}
              </span>
              <span className="block text-xs text-muted-foreground">DNI {alumno.dni}</span>
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-sm border",
                present
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background",
              )}
            >
              {present ? <Check className="size-3.5" /> : null}
            </span>
          </CheckboxPrimitive.Root>
        );
      })}
    </div>
  );
}
