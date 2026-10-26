import type { CursadaConAlumno } from "@/lib/academic";
import { formatHorasPar, formatPorcentaje } from "@/lib/format";
import { EstadoBadge } from "@/components/estado-badge";

export function ListaPlanillaMobile({ rows }: { rows: readonly CursadaConAlumno[] }) {
  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-background md:hidden">
      {rows.map(({ cursada, alumno }) => (
        <li key={cursada.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {alumno.apellido}, {alumno.nombre}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              DNI {alumno.dni} ·{" "}
              {formatHorasPar(cursada.resumen.horasAsistidas, cursada.resumen.horasDictadas)} h
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm tabular-nums">
              {formatPorcentaje(cursada.resumen.porcentaje)}
            </p>
            <EstadoBadge condicion={cursada.condicion} className="mt-1 justify-end" />
          </div>
        </li>
      ))}
    </ul>
  );
}
