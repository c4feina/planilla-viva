import { formatNumero, formatPorcentaje } from "@/lib/format";

interface MetricaProps {
  label: string;
  value: string;
  context: string;
}

function Metrica({ label, value, context }: MetricaProps) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{context}</p>
    </div>
  );
}

export function MetricasTablero({
  alumnosActivos,
  comisiones,
  asistenciaPromedio,
}: {
  alumnosActivos: number;
  comisiones: number;
  asistenciaPromedio: number | null;
}) {
  return (
    <div className="mb-6 grid grid-cols-1 divide-y divide-border rounded-md border border-border bg-background sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <Metrica
        label="Alumnos activos"
        value={formatNumero(alumnosActivos)}
        context="inscriptos en el ciclo"
      />
      <Metrica
        label="Materias"
        value={formatNumero(comisiones)}
        context="con docentes asignados"
      />
      <Metrica
        label="Asistencia promedio"
        value={formatPorcentaje(asistenciaPromedio)}
        context="promedio de las materias"
      />
    </div>
  );
}
