import {
  getMarcaAsistenciaLabel,
  isMarcaAsistencia,
  MARCA_ASISTENCIA_LABELS,
  MARCA_ASISTENCIA_OPTIONS,
} from "@/lib/asistencia";
import type { MarcaAsistencia } from "@/lib/types";
import { cn } from "@/lib/utils";

const MARK_COLORS: Record<MarcaAsistencia, string> = {
  P: "text-emerald-700 dark:text-emerald-400",
  A: "text-red-700 dark:text-red-400",
  J: "text-amber-700 dark:text-amber-400",
  T: "text-blue-700 dark:text-blue-400",
};

export function CeldaAsistencia({
  marca,
  computable,
  editable = false,
  ariaLabel,
  onChange,
}: {
  marca: MarcaAsistencia | undefined;
  computable: boolean;
  editable?: boolean;
  ariaLabel?: string;
  onChange?: (marca: MarcaAsistencia | undefined) => void;
}) {
  if (!computable) {
    return (
      <span className="text-xs text-muted-foreground/40" aria-label="Clase no computable">
        –
      </span>
    );
  }

  if (editable && onChange !== undefined) {
    return (
      <select
        value={marca ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          onChange(value === "" || !isMarcaAsistencia(value) ? undefined : value);
        }}
        aria-label={ariaLabel ?? "Marca de asistencia"}
        title={`${getMarcaAsistenciaLabel(marca)}. Elegí una marca para corregir.`}
        className={cn(
          "h-7 w-11 rounded-sm border border-input bg-background px-0.5 text-center text-xs font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          marca === undefined ? "text-muted-foreground" : MARK_COLORS[marca],
        )}
      >
        <option value="">–</option>
        {MARCA_ASISTENCIA_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (marca === undefined) {
    return (
      <span className="text-xs text-muted-foreground/40" aria-label="Sin marca">
        –
      </span>
    );
  }

  return (
    <span
      className={cn("text-xs font-semibold", MARK_COLORS[marca])}
      aria-label={MARCA_ASISTENCIA_LABELS[marca]}
      title={MARCA_ASISTENCIA_LABELS[marca]}
    >
      {marca}
    </span>
  );
}
