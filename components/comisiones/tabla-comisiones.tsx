import Link from "next/link";

import type { ComisionResumen } from "@/lib/academic";
import { getDocentesLabel } from "@/lib/academic";
import { formatAnio, formatPorcentaje } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TablaComisiones({ rows }: { rows: readonly ComisionResumen[] }) {
  return (
    <div className="hidden rounded-md border border-border bg-background md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Materia</TableHead>
            <TableHead className="w-20">Año</TableHead>
            <TableHead className="hidden w-72 lg:table-cell">Docentes</TableHead>
            <TableHead className="w-24 text-right">Inscriptos</TableHead>
            <TableHead className="w-40 text-right whitespace-nowrap">Asistencia promedio</TableHead>
            <TableHead className="w-20 text-right">Libres</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.comision.id} className="h-10">
              <TableCell>
                <Link
                  href={`/comisiones/${row.comision.id}/planilla`}
                  className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {row.unidad.nombre}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground lg:hidden">
                  {getDocentesLabel(row.docentes)}
                </p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatAnio(row.comision.anio)}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {getDocentesLabel(row.docentes)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.inscriptos}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPorcentaje(row.comision.asistenciaPromedio)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  row.libres > 0 ? "text-red-700 dark:text-red-400" : "text-muted-foreground",
                )}
              >
                {row.libres}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
