import type { Clase, Evaluacion, HorasClase, TipoClase } from "@/lib/types";
import type { Rng } from "@/lib/mock/random";

const FIRST_MONDAY = Date.UTC(2026, 2, 9);
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WEEKS = 14;

function toIsoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function buildClases(comisionId: string, weekday: number, rng: Rng): Clase[] {
  const classIndexes = Array.from({ length: WEEKS }, (_, index) => index);
  const specialIndexes = rng.shuffle(classIndexes).slice(0, 3);
  const feriadoIndexes = new Set(specialIndexes.slice(0, 2));
  const canceladaIndexes = new Set(specialIndexes.slice(2));
  const longClassIndexes = new Set(rng.shuffle(classIndexes).slice(0, 2));

  return classIndexes.map((index) => {
    const timestamp = FIRST_MONDAY + (weekday + index * 7) * DAY_IN_MS;
    const horas: HorasClase = longClassIndexes.has(index) ? 3 : 2;
    let tipo: TipoClase = "normal";

    if (feriadoIndexes.has(index)) {
      tipo = "feriado";
    } else if (canceladaIndexes.has(index)) {
      tipo = "cancelada";
    }

    return {
      id: `${comisionId}-c${String(index + 1).padStart(2, "0")}`,
      comision: comisionId,
      fecha: toIsoDate(timestamp),
      horas,
      tipo,
    };
  });
}

export function buildEvaluaciones(comisionId: string): Evaluacion[] {
  return [
    {
      id: `${comisionId}-parcial`,
      comision: comisionId,
      tipo: "parcial",
      nombre: "Parcial 1",
      fecha: "2026-05-15",
      obligatoria: true,
    },
    {
      id: `${comisionId}-tp`,
      comision: comisionId,
      tipo: "tp",
      nombre: "TP 1",
      fecha: "2026-06-05",
      obligatoria: true,
    },
    {
      id: `${comisionId}-recuperatorio`,
      comision: comisionId,
      tipo: "recuperatorio",
      nombre: "Recuperatorio",
      fecha: "2026-06-26",
      obligatoria: false,
    },
  ];
}
