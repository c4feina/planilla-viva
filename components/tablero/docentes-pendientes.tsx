import { formatNumero } from "@/lib/format";
import type { DocentePendiente } from "@/lib/selectores";

export function DocentesPendientes({ rows }: { rows: readonly DocentePendiente[] }) {
  return (
    <section aria-labelledby="docentes-pendientes" className="mb-8 scroll-mt-20">
      <h2 id="docentes-pendientes" className="mb-1 text-base font-semibold">
        Docentes con notas pendientes
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Evaluaciones obligatorias sin nota en materias con alumnos activos.
      </p>

      {rows.length === 0 ? (
        <p className="rounded-md border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
          No hay evaluaciones obligatorias pendientes de carga.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-background">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Docentes con evaluaciones obligatorias pendientes de carga
            </caption>
            <thead className="bg-muted/30">
              <tr className="border-b border-border">
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase"
                >
                  Docente
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-right text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase"
                >
                  Materias afectadas
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-right text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase"
                >
                  Notas pendientes
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.docente.id}
                  className="h-10 border-b border-border last:border-b-0 hover:bg-muted/40"
                >
                  <th scope="row" className="px-3 py-1 text-left font-normal">
                    {row.docente.apellido}, {row.docente.nombre}
                  </th>
                  <td className="px-3 py-1 text-right text-sm tabular-nums">
                    {formatNumero(row.comisiones)}
                  </td>
                  <td className="px-3 py-1 text-right text-sm tabular-nums">
                    {formatNumero(row.notasPendientes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
