"use client";

import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import type { Evaluacion } from "@/lib/types";

export function TabsEvaluaciones({
  evaluaciones,
  activeId,
  onChange,
}: {
  evaluaciones: readonly Evaluacion[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + offset + evaluaciones.length) % evaluaciones.length;
    const next = evaluaciones[nextIndex];

    if (next === undefined) {
      return;
    }

    onChange(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  }

  return (
    <div role="tablist" aria-label="Evaluaciones de la materia" className="mb-4 flex gap-1 border-b border-border">
      {evaluaciones.map((evaluacion, index) => {
        const active = evaluacion.id === activeId;

        return (
          <button
            key={evaluacion.id}
            id={`tab-${evaluacion.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${evaluacion.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(evaluacion.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {evaluacion.nombre}
          </button>
        );
      })}
    </div>
  );
}
