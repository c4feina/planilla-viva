import type { CursadaConAlumno } from "@/lib/academic";
import { formatFechaCorta, formatHorasPar, formatPorcentaje } from "@/lib/format";
import type { Clase, MarcaAsistencia, TipoClase } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CeldaAsistencia } from "@/components/planilla/celda-asistencia";
import { PiePlanilla } from "@/components/planilla/pie-planilla";
import { EstadoBadge } from "@/components/estado-badge";

const CLASS_TYPE_LABELS: Record<TipoClase, string> = {
  normal: "",
  cancelada: "Cancelada",
  feriado: "Feriado",
};

export function TablaPlanilla({
  titulo,
  rows,
  clases,
  editable = false,
  onMarcaChange,
}: {
  titulo: string;
  rows: readonly CursadaConAlumno[];
  clases: readonly Clase[];
  editable?: boolean;
  onMarcaChange?: (
    cursadaId: string,
    claseId: string,
    marca: MarcaAsistencia | undefined,
  ) => void;
}) {
  return (
    <div className="hidden rounded-md border border-border bg-background md:block">
      <div className="max-h-screen overflow-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Planilla de asistencia de {titulo}</caption>
          <thead className="sticky top-0 z-10 bg-secondary">
            <tr className="border-b border-border">
              <th
                scope="col"
                className="sticky left-0 z-20 w-56 min-w-56 border-r border-border bg-secondary px-3 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                Alumno
              </th>
              {clases.map((clase) => {
                const computable = clase.tipo === "normal";

                return (
                  <th
                    key={clase.id}
                    scope="col"
                    title={computable ? undefined : CLASS_TYPE_LABELS[clase.tipo]}
                    className="w-9 px-1 py-2 text-center text-xs font-medium tracking-wide"
                  >
                    <span
                      className={cn(
                        "block whitespace-nowrap",
                        !computable && "text-muted-foreground line-through",
                      )}
                    >
                      {formatFechaCorta(clase.fecha)}
                    </span>
                    {computable ? (
                      <span className="block whitespace-nowrap text-xs font-normal text-muted-foreground">
                        {clase.horas} h
                      </span>
                    ) : (
                      <span className="sr-only">{CLASS_TYPE_LABELS[clase.tipo]}</span>
                    )}
                  </th>
                );
              })}
              <th
                scope="col"
                className="w-16 px-2 py-2 text-right text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase"
              >
                Horas
              </th>
              <th
                scope="col"
                className="w-16 px-2 py-2 text-right text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase"
              >
                %
              </th>
              <th
                scope="col"
                className="w-24 px-2 py-2 text-left text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase"
              >
                Condición
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ cursada, alumno }) => (
              <tr
                key={cursada.id}
                className="group h-10 border-b border-border last:border-b-0 hover:bg-muted/40"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 w-56 min-w-56 border-r border-border bg-background px-3 py-1 text-left font-normal group-hover:bg-muted/40"
                >
                  <span className="block text-sm leading-tight font-medium">
                    {alumno.apellido}, {alumno.nombre}
                  </span>
                  <span className="block text-xs leading-tight text-muted-foreground">
                    DNI {alumno.dni}
                  </span>
                </th>
                {clases.map((clase) => (
                  <td key={clase.id} className="px-1 py-1 text-center">
                    <CeldaAsistencia
                      marca={cursada.marcas[clase.id]}
                      computable={clase.tipo === "normal"}
                      editable={editable}
                      ariaLabel={`Asistencia de ${alumno.apellido}, ${alumno.nombre} el ${formatFechaCorta(clase.fecha)}`}
                      onChange={
                        editable
                          ? (marca) => onMarcaChange?.(cursada.id, clase.id, marca)
                          : undefined
                      }
                    />
                  </td>
                ))}
                <td className="px-2 py-1 text-right text-xs whitespace-nowrap tabular-nums text-muted-foreground">
                  {formatHorasPar(cursada.resumen.horasAsistidas, cursada.resumen.horasDictadas)}
                </td>
                <td className="px-2 py-1 text-right text-xs whitespace-nowrap tabular-nums">
                  {formatPorcentaje(cursada.resumen.porcentaje)}
                </td>
                <td className="px-2 py-1">
                  <EstadoBadge condicion={cursada.condicion} />
                </td>
              </tr>
            ))}
          </tbody>
          <PiePlanilla rows={rows} clases={clases} />
        </table>
      </div>
    </div>
  );
}
