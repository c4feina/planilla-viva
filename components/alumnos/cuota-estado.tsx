import { formatCuota } from "@/lib/alumnos";
import { cn } from "@/lib/utils";

export function CuotaEstado({
  alDia,
  className,
}: {
  alDia: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap",
        alDia ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      {formatCuota(alDia)}
    </span>
  );
}
