import { CONDICION_COLORS, CONDICION_LABELS } from "@/lib/condiciones";
import { formatNumero } from "@/lib/format";
import type { Condicion } from "@/lib/types";
import { cn } from "@/lib/utils";

const CONDICIONES: Condicion[] = ["cursando", "regular", "libre", "aprobada", "recursa"];

export function MetricasAlumno({
  total,
  condiciones,
}: {
  total: number;
  condiciones: Record<Condicion, number>;
}) {
  return (
    <section aria-labelledby="metricas-alumno" className="mb-6">
      <h2 id="metricas-alumno" className="mb-3 text-base font-semibold">
        Situación general
      </h2>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
        <div className="bg-background px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Cursadas</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{formatNumero(total)}</p>
        </div>
        {CONDICIONES.map((condicion) => (
          <div key={condicion} className="bg-background px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {CONDICION_LABELS[condicion]}
            </p>
            <p
              className={cn(
                "mt-1 inline-flex items-center gap-2 text-lg font-semibold tabular-nums",
                condiciones[condicion] === 0
                  ? "text-muted-foreground"
                  : CONDICION_COLORS[condicion],
              )}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              {formatNumero(condiciones[condicion])}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
