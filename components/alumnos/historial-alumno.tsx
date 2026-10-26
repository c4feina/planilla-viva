import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFechaHora } from "@/lib/format";
import type { CambioAlumno } from "@/lib/types";

export function HistorialAlumno({ rows }: { rows: readonly CambioAlumno[] }) {
  return (
    <section aria-labelledby="historial-alumno" className="mb-6">
      <h2 id="historial-alumno" className="mb-1 text-base font-semibold">
        Historial de cambios
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Altas, ediciones y bajas registradas en esta sesión.
      </p>

      {rows.length === 0 ? (
        <p className="rounded-md border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
          Sin cambios registrados. Las altas, ediciones y bajas de este alumno van a aparecer acá.
        </p>
      ) : (
        <div className="rounded-md border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-40 whitespace-nowrap">Fecha y hora</TableHead>
                <TableHead className="w-40">Campo</TableHead>
                <TableHead>Valor anterior</TableHead>
                <TableHead>Valor nuevo</TableHead>
                <TableHead className="w-32">Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((cambio) => (
                <TableRow key={cambio.id} className="h-10">
                  <TableCell className="text-xs whitespace-nowrap tabular-nums text-muted-foreground">
                    {formatFechaHora(cambio.fecha)}
                  </TableCell>
                  <TableCell className="text-sm">{cambio.campo}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {cambio.valorAnterior}
                  </TableCell>
                  <TableCell className="text-sm">{cambio.valorNuevo}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{cambio.actor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
