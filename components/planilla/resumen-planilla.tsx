import { formatNumero, formatPorcentaje } from "@/lib/format";

interface StatProps {
  label: string;
  value: string;
  context: string;
}

function Stat({ label, value, context }: StatProps) {
  return (
    <div className="bg-background px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{context}</p>
    </div>
  );
}

export function ResumenPlanilla({
  asistenciaPromedio,
  inscriptos,
  libres,
  cursando,
}: {
  asistenciaPromedio: number | null;
  inscriptos: number;
  libres: number;
  cursando: number;
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-4">
      <Stat
        label="Inscriptos"
        value={formatNumero(inscriptos)}
        context="alumnos activos"
      />
      <Stat
        label="Asistencia promedio"
        value={formatPorcentaje(asistenciaPromedio)}
        context="según cursadas cargadas"
      />
      <Stat label="Libres" value={formatNumero(libres)} context="por asistencia" />
      <Stat label="Cursando" value={formatNumero(cursando)} context="sin condición definida" />
    </div>
  );
}
