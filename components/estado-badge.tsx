import type { Condicion } from "@/lib/types";
import { CONDICION_COLORS, CONDICION_LABELS } from "@/lib/condiciones";
import { cn } from "@/lib/utils";

export function EstadoBadge({
  condicion,
  className,
}: {
  condicion: Condicion;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap",
        CONDICION_COLORS[condicion],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      {CONDICION_LABELS[condicion]}
    </span>
  );
}
