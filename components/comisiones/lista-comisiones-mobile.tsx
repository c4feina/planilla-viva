import Link from "next/link";

import type { ComisionResumen } from "@/lib/academic";
import { getDocentesLabel } from "@/lib/academic";
import { formatAnio, formatPorcentaje } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ListaComisionesMobile({ rows }: { rows: readonly ComisionResumen[] }) {
  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-background md:hidden">
      {rows.map((row) => (
        <li key={row.comision.id} className="flex items-start justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <Link
              href={`/comisiones/${row.comision.id}/planilla`}
              className="text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {row.unidad.nombre}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatAnio(row.comision.anio)} año · {getDocentesLabel(row.docentes)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm tabular-nums">
              {formatPorcentaje(row.comision.asistenciaPromedio)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{row.inscriptos} inscriptos</p>
            <p
              className={cn(
                "mt-1 text-xs",
                row.libres > 0 ? "text-red-700 dark:text-red-400" : "text-muted-foreground",
              )}
            >
              {row.libres} libres
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
