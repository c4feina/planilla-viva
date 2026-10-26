import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  titulo,
  descripcion,
  accion,
  className,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-background px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium">{titulo}</p>
      {descripcion !== undefined ? (
        <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>
      ) : null}
      {accion !== undefined ? <div className="pt-2">{accion}</div> : null}
    </div>
  );
}
