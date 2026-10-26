import { CONDICION_COLORS, CONDICION_LABELS } from "@/lib/condiciones";
import { formatAnio, formatNumero } from "@/lib/format";
import type { Condicion } from "@/lib/types";
import type { TableroAnio, TableroComision } from "@/lib/selectores";
import { cn } from "@/lib/utils";

const CONDICIONES: Condicion[] = ["cursando", "regular", "libre", "aprobada", "recursa"];

function Conteo({ condicion, cantidad }: { condicion: Condicion; cantidad: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 tabular-nums",
        cantidad === 0 ? "text-muted-foreground" : CONDICION_COLORS[condicion],
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      {formatNumero(cantidad)}
    </span>
  );
}

function TablaComisiones({ fila }: { fila: TableroAnio }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-background">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Estado de las materias de {formatAnio(fila.anio)} año
        </caption>
        <thead className="bg-muted/30">
          <tr className="border-b border-border">
            <th
              scope="col"
              className="min-w-56 px-3 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              Materia
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-right text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              Inscriptos
            </th>
            {CONDICIONES.map((condicion) => (
              <th
                key={condicion}
                scope="col"
                className="px-3 py-2 text-right text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase"
              >
                {CONDICION_LABELS[condicion]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fila.comisiones.map((comision: TableroComision) => (
            <tr
              key={comision.comision.id}
              className="h-10 border-b border-border last:border-b-0 hover:bg-muted/40"
            >
              <th scope="row" className="px-3 py-1 text-left font-normal">
                <span className="text-sm font-medium">{comision.unidad.nombre}</span>
              </th>
              <td className="px-3 py-1 text-right text-sm tabular-nums">
                {formatNumero(comision.inscriptos)}
              </td>
              {CONDICIONES.map((condicion) => (
                <td key={condicion} className="px-3 py-1 text-right text-sm">
                  <Conteo condicion={condicion} cantidad={comision.condiciones[condicion]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/30">
            <th scope="row" className="px-3 py-2 text-left text-xs font-medium">
              Total de inscripciones
            </th>
            <td className="px-3 py-2 text-right text-sm font-medium tabular-nums">
              {formatNumero(fila.inscriptos)}
            </td>
            {CONDICIONES.map((condicion) => (
              <td key={condicion} className="px-3 py-2 text-right text-sm font-medium">
                <Conteo condicion={condicion} cantidad={fila.condiciones[condicion]} />
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function EstadoComisiones({ anios }: { anios: readonly TableroAnio[] }) {
  return (
    <section aria-labelledby="estado-comisiones" className="mb-8 scroll-mt-20">
      <h2 id="estado-comisiones" className="mb-3 text-base font-semibold">
        Estado por año y materia
      </h2>
      <p className="mb-3 text-xs text-muted-foreground md:hidden">
        Deslizá cada tabla para ver todas las condiciones.
      </p>
      <div className="flex flex-col gap-6">
        {anios.map((fila) => (
          <div key={fila.anio}>
            <h3 className="mb-2 text-sm font-medium">
              {formatAnio(fila.anio)} año
              <span className="ml-2 font-normal text-muted-foreground">
                {formatNumero(fila.alumnos)} alumnos en materias
              </span>
            </h3>
            <TablaComisiones fila={fila} />
          </div>
        ))}
      </div>
    </section>
  );
}
