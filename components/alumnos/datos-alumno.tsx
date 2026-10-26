import { CuotaEstado } from "@/components/alumnos/cuota-estado";
import { formatAnio } from "@/lib/format";
import type { Alumno } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DatosAlumno({ alumno }: { alumno: Alumno }) {
  return (
    <section aria-labelledby="datos-alumno" className="mb-6">
      <h2 id="datos-alumno" className="sr-only">
        Datos del alumno
      </h2>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-5">
        <div className="bg-background px-4 py-3">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Legajo</dt>
          <dd className="mt-1 text-sm font-medium tabular-nums">{alumno.legajo}</dd>
        </div>
        <div className="bg-background px-4 py-3">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">DNI</dt>
          <dd className="mt-1 text-sm font-medium tabular-nums">{alumno.dni}</dd>
        </div>
        <div className="bg-background px-4 py-3">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Año</dt>
          <dd className="mt-1 text-sm font-medium">{formatAnio(alumno.anioCursada)}</dd>
        </div>
        <div className="bg-background px-4 py-3">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Estado</dt>
          <dd
            className={cn(
              "mt-1 inline-flex items-center gap-2 text-sm font-medium",
              alumno.activo
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-muted-foreground",
            )}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {alumno.activo ? "Activo" : "De baja"}
          </dd>
        </div>
        <div className="col-span-2 bg-background px-4 py-3 lg:col-span-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Cuota al día
          </dt>
          <dd className="mt-1">
            <CuotaEstado alDia={alumno.cuotaAlDia} className="text-sm" />
          </dd>
        </div>
      </dl>
    </section>
  );
}
