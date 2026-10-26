import type { MarcaAsistencia } from "@/lib/types";

export const MARCA_ASISTENCIA_LABELS: Record<MarcaAsistencia, string> = {
  P: "Presente",
  A: "Ausente",
  J: "Justificada",
  T: "Tardanza",
};

export const MARCA_ASISTENCIA_OPTIONS: readonly MarcaAsistencia[] = ["P", "A", "J", "T"];

export function isMarcaAsistencia(value: string): value is MarcaAsistencia {
  return value === "P" || value === "A" || value === "J" || value === "T";
}

export function getMarcaAsistenciaLabel(marca: MarcaAsistencia | undefined): string {
  return marca === undefined ? "Sin marca" : MARCA_ASISTENCIA_LABELS[marca];
}
