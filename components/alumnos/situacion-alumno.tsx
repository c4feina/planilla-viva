import Link from "next/link";

import { EstadoBadge } from "@/components/estado-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAnio, formatHorasPar, formatPorcentaje } from "@/lib/format";
import type { SituacionAlumno } from "@/lib/selectores";

export function SituacionAlumno({ rows }: { rows: readonly SituacionAlumno[] }) {
  return (
    <section aria-labelledby="situacion-alumno" className="mb-6">
      <h2 id="situacion-alumno" className="mb-3 text-base font-semibold">
        Situación por materia
      </h2>

      {rows.length === 0 ? (
        <p className="rounded-md border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
          El alumno no tiene cursadas registradas.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background md:hidden">
            {rows.map((row) => (
              <li key={row.cursada.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/comisiones/${row.comision.id}/planilla`}
                    className="text-sm font-medium underline-offset-4 hover:text-primary hover:underline"
                  >
                    {row.unidad.nombre}
                  </Link>
                  <EstadoBadge condicion={row.cursada.condicion} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatAnio(row.comision.anio)} año ·{" "}
                  {formatHorasPar(
                    row.cursada.resumen.horasAsistidas,
                    row.cursada.resumen.horasDictadas,
                  )}{" "}
                  · {formatPorcentaje(row.cursada.resumen.porcentaje)}
                  {row.cursada.condicionManual ? " · Ajuste manual" : ""}
                </p>
              </li>
            ))}
          </ul>

          <div className="hidden rounded-md border border-border bg-background md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Materia</TableHead>
                  <TableHead className="w-28 text-right">Horas asistidas</TableHead>
                  <TableHead className="w-24 text-right">Porcentaje</TableHead>
                  <TableHead className="w-40">Condición</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.cursada.id} className="h-10">
                    <TableCell>
                      <Link
                        href={`/comisiones/${row.comision.id}/planilla`}
                        className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        {row.unidad.nombre}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-xs whitespace-nowrap tabular-nums">
                      {formatHorasPar(
                        row.cursada.resumen.horasAsistidas,
                        row.cursada.resumen.horasDictadas,
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {formatPorcentaje(row.cursada.resumen.porcentaje)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <EstadoBadge condicion={row.cursada.condicion} />
                        {row.cursada.condicionManual ? (
                          <span className="rounded-sm border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                            Ajuste manual
                          </span>
                        ) : null}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
