import type { Alumno, AnioCursada } from "@/lib/types";
import { APELLIDOS, NOMBRES, UNIDADES } from "@/lib/mock/catalog";
import { createRng } from "@/lib/mock/random";

const COHORT_SIZES: readonly { anio: AnioCursada; cantidad: number }[] = [
  { anio: 1, cantidad: 32 },
  { anio: 2, cantidad: 24 },
  { anio: 3, cantidad: 18 },
  { anio: 4, cantidad: 15 },
];

const TOTAL_ALUMNOS = COHORT_SIZES.reduce((total, cohort) => total + cohort.cantidad, 0);

function buildCohortYears(): AnioCursada[] {
  return COHORT_SIZES.flatMap((cohort) =>
    Array.from({ length: cohort.cantidad }, () => cohort.anio),
  );
}

function buildUniqueNames(): { nombre: string; apellido: string }[] {
  const rng = createRng("alumnos-nombres-2026");
  const used = new Set<string>();
  const names: { nombre: string; apellido: string }[] = [];

  for (let index = 0; index < TOTAL_ALUMNOS; index += 1) {
    let nombre = "";
    let apellido = "";

    for (let attempt = 0; attempt < 500; attempt += 1) {
      const candidateNombre = rng.pick(NOMBRES);
      const candidateApellido = rng.pick(APELLIDOS);
      const key = `${candidateApellido}|${candidateNombre}`;

      if (!used.has(key)) {
        nombre = candidateNombre;
        apellido = candidateApellido;
        used.add(key);
        break;
      }
    }

    if (nombre === "" || apellido === "") {
      throw new Error("No se pudieron generar nombres de alumnos únicos.");
    }

    names.push({ nombre, apellido });
  }

  return names;
}

function buildUniqueDnis(): string[] {
  const rng = createRng("alumnos-dni-2026");
  const used = new Set<string>();
  const dnis: string[] = [];

  while (dnis.length < TOTAL_ALUMNOS) {
    const dni = String(20_000_000 + rng.int(25_000_000));

    if (!used.has(dni)) {
      used.add(dni);
      dnis.push(dni);
    }
  }

  return dnis;
}

function buildCuotaStatus(): boolean[] {
  const rng = createRng("alumnos-cuota-2026");
  const indexes = rng.shuffle(Array.from({ length: TOTAL_ALUMNOS }, (_, index) => index));
  const sinCuota = new Set(indexes.slice(0, 8));

  return Array.from({ length: TOTAL_ALUMNOS }, (_, index) => !sinCuota.has(index));
}

export function buildAlumnos(): Alumno[] {
  const names = buildUniqueNames();
  const dnis = buildUniqueDnis();
  const cuota = buildCuotaStatus();
  const years = buildCohortYears();

  return years.map((anioCursada, index) => {
    const name = names[index];
    const dni = dnis[index];
    const cuotaAlDia = cuota[index];

    if (name === undefined || dni === undefined || cuotaAlDia === undefined) {
      throw new Error("Faltan datos para construir un alumno.");
    }

    return {
      id: `al-${String(index + 1).padStart(3, "0")}`,
      legajo: String(20200 + index),
      dni,
      apellido: name.apellido,
      nombre: name.nombre,
      anioCursada,
      cuotaAlDia,
      activo: true,
    };
  });
}

export function buildRecursantes(alumnos: readonly Alumno[]): Map<string, string> {
  const rng = createRng("alumnos-recursantes-2026");
  const candidates = alumnos.filter((alumno) => alumno.anioCursada > 1);
  const selected = rng.shuffle(candidates).slice(0, 5);
  const assignments = new Map<string, string>();

  for (const alumno of selected) {
    const previousYear = (1 + rng.int(alumno.anioCursada - 1)) as AnioCursada;
    const units = UNIDADES.filter((unidad) => unidad.anio === previousYear);
    const unidad = rng.pick(units);
    assignments.set(alumno.id, unidad.id);
  }

  return assignments;
}
