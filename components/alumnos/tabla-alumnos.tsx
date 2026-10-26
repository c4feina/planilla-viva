import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CuotaEstado } from "@/components/alumnos/cuota-estado";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAlumnoNombre } from "@/lib/alumnos";
import { formatAnio } from "@/lib/format";
import type { Alumno } from "@/lib/types";

export function TablaAlumnos({ rows }: { rows: readonly Alumno[] }) {
  return (
    <div className="hidden rounded-md border border-border bg-background md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-24">Legajo</TableHead>
            <TableHead>Apellido y nombre</TableHead>
            <TableHead className="w-32">DNI</TableHead>
            <TableHead className="w-16">Año</TableHead>
            <TableHead className="w-32">Cuota al día</TableHead>
            <TableHead className="w-28 text-right">
              <span className="sr-only">Ficha</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((alumno) => (
            <TableRow key={alumno.id} className="h-10">
              <TableCell className="tabular-nums text-muted-foreground">{alumno.legajo}</TableCell>
              <TableCell>
                <Link
                  href={`/alumnos/${alumno.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {getAlumnoNombre(alumno)}
                </Link>
                {alumno.activo ? null : (
                  <span className="ml-2 text-xs text-muted-foreground">De baja</span>
                )}
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{alumno.dni}</TableCell>
              <TableCell className="text-muted-foreground">{formatAnio(alumno.anioCursada)}</TableCell>
              <TableCell>
                <CuotaEstado alDia={alumno.cuotaAlDia} />
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/alumnos/${alumno.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                  aria-label={`Ver ficha de ${getAlumnoNombre(alumno)}`}
                >
                  Ver ficha
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
