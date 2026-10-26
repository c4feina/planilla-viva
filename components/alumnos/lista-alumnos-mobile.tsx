import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CuotaEstado } from "@/components/alumnos/cuota-estado";
import { getAlumnoNombre } from "@/lib/alumnos";
import { formatAnio } from "@/lib/format";
import type { Alumno } from "@/lib/types";

export function ListaAlumnosMobile({ rows }: { rows: readonly Alumno[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background md:hidden">
      {rows.map((alumno) => (
        <li key={alumno.id}>
          <Link
            href={`/alumnos/${alumno.id}`}
            className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-muted/40"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{getAlumnoNombre(alumno)}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Legajo {alumno.legajo} · DNI {alumno.dni} · {formatAnio(alumno.anioCursada)}
              </span>
              <span className="mt-1 flex items-center gap-2">
                <CuotaEstado alDia={alumno.cuotaAlDia} />
                {alumno.activo ? null : (
                  <span className="text-xs text-muted-foreground">De baja</span>
                )}
              </span>
            </span>
            <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
