import type {
  Alumno,
  Clase,
  Comision,
  Condicion,
  Cursada,
  Evaluacion,
  MarcaAsistencia,
  ParametrosAcademicos,
} from "@/lib/types";
import { deriveCursada, summarizeAsistencia } from "@/lib/mock/derive";
import { createRng, type Rng } from "@/lib/mock/random";

interface ConditionCounts {
  libre: number;
  regular: number;
  aprobada: number;
  cursando: number;
  recursa: number;
}

interface SpecialUsage {
  tardanzas: Set<string>;
  justificadas: Set<string>;
}

export interface BuildCursadasInput {
  comision: Comision;
  clases: readonly Clase[];
  evaluaciones: readonly Evaluacion[];
  alumnos: readonly Alumno[];
  parametros: ParametrosAcademicos;
  usedCountKeys: Set<string>;
  allowEmptyMarks: boolean;
}

function enumerateConditionCounts(total: number): ConditionCounts[] {
  const minRegular = Math.ceil(total * 0.4);
  const maxRegular = Math.floor(total * 0.6);
  const minAprobada = Math.ceil(total * 0.1);
  const maxAprobada = Math.floor(total * 0.25);
  const minCursando = Math.ceil(total * 0.05);
  const maxCursando = Math.floor(total * 0.12);
  const results: ConditionCounts[] = [];

  for (let libre = 2; libre <= 6; libre += 1) {
    for (let recursa = 0; recursa <= 2; recursa += 1) {
      for (let cursando = minCursando; cursando <= maxCursando; cursando += 1) {
        for (let aprobada = minAprobada; aprobada <= maxAprobada; aprobada += 1) {
          const regular = total - libre - recursa - cursando - aprobada;

          if (regular >= minRegular && regular <= maxRegular) {
            results.push({ libre, regular, aprobada, cursando, recursa });
          }
        }
      }
    }
  }

  return results;
}

function countKey(total: number, counts: ConditionCounts): string {
  return [
    total,
    counts.libre,
    counts.regular,
    counts.aprobada,
    counts.cursando,
    counts.recursa,
  ].join(":");
}

function pickConditionCounts(
  total: number,
  rng: Rng,
  usedKeys: Set<string>,
): ConditionCounts {
  const options = enumerateConditionCounts(total).filter(
    (counts) => !usedKeys.has(countKey(total, counts)),
  );
  const chosen = options[rng.int(options.length)];

  if (chosen === undefined) {
    throw new Error(`No hay distribuciones disponibles para una comisión de ${total} alumnos.`);
  }

  usedKeys.add(countKey(total, chosen));
  return chosen;
}

function expandTargets(counts: ConditionCounts): Condicion[] {
  const targets: Condicion[] = [];

  for (let index = 0; index < counts.libre; index += 1) targets.push("libre");
  for (let index = 0; index < counts.regular; index += 1) targets.push("regular");
  for (let index = 0; index < counts.aprobada; index += 1) targets.push("aprobada");
  for (let index = 0; index < counts.cursando; index += 1) targets.push("cursando");
  for (let index = 0; index < counts.recursa; index += 1) targets.push("recursa");

  return targets;
}

function presenceProbability(target: Condicion, rng: Rng): number {
  if (target === "libre") {
    return rng.between(0.42, 0.68);
  }

  if (target === "aprobada") {
    return rng.between(0.88, 0.98);
  }

  if (target === "recursa") {
    return rng.between(0.8, 0.9);
  }

  return rng.between(0.82, 0.95);
}

function buildMarks(
  rng: Rng,
  clases: readonly Clase[],
  target: Condicion,
  usage: SpecialUsage,
  parametros: ParametrosAcademicos,
): Record<string, MarcaAsistencia> {
  const computableClasses = clases.filter((clase) => clase.tipo === "normal");
  const presence = presenceProbability(target, rng);
  const marcas: Record<string, MarcaAsistencia> = {};

  for (const clase of computableClasses) {
    if (rng.next() < presence) {
      marcas[clase.id] = "P";
      continue;
    }

    const roll = rng.next();

    if (roll < 0.08 && !usage.tardanzas.has(clase.id)) {
      marcas[clase.id] = "T";
      usage.tardanzas.add(clase.id);
    } else if (roll < 0.2 && !usage.justificadas.has(clase.id)) {
      marcas[clase.id] = "J";
      usage.justificadas.add(clase.id);
    } else {
      marcas[clase.id] = "A";
    }
  }

  const maxAdjustments = computableClasses.length * 4;

  for (let attempt = 0; attempt < maxAdjustments; attempt += 1) {
    const porcentaje = summarizeAsistencia(clases, marcas, parametros).porcentaje;

    if (porcentaje === null) {
      break;
    }

    if (target === "libre") {
      if (porcentaje < 74.5) {
        break;
      }

      const candidates = computableClasses.filter((clase) => marcas[clase.id] === "P");
      const candidate = candidates[rng.int(candidates.length)];

      if (candidate === undefined) {
        break;
      }

      marcas[candidate.id] = "A";
      continue;
    }

    if (porcentaje >= 76) {
      break;
    }

    const candidates = computableClasses.filter((clase) => marcas[clase.id] !== "P");
    const candidate = candidates[rng.int(candidates.length)];

    if (candidate === undefined) {
      break;
    }

    marcas[candidate.id] = "P";
  }

  return marcas;
}

function buildNotes(
  rng: Rng,
  evaluaciones: readonly Evaluacion[],
  target: Condicion,
): Record<string, number> {
  const obligatorias = evaluaciones.filter((evaluacion) => evaluacion.obligatoria);
  const notas: Record<string, number> = {};

  if (target === "cursando") {
    const omitted = obligatorias[rng.int(obligatorias.length)];

    for (const evaluacion of obligatorias) {
      if (evaluacion.id !== omitted?.id) {
        notas[evaluacion.id] = 4 + rng.int(5);
      }
    }
  } else {
    for (const evaluacion of obligatorias) {
      if (target === "recursa") {
        notas[evaluacion.id] = 1 + rng.int(3);
      } else if (target === "aprobada") {
        notas[evaluacion.id] = 7 + rng.int(4);
      } else if (target === "regular") {
        notas[evaluacion.id] = 4 + rng.int(3);
      } else {
        notas[evaluacion.id] = 4 + rng.int(5);
      }
    }
  }

  const recuperatorio = evaluaciones.find((evaluacion) => !evaluacion.obligatoria);

  if (recuperatorio !== undefined && rng.next() < 0.3) {
    notas[recuperatorio.id] = 4 + rng.int(7);
  }

  return notas;
}

export function buildCursadasForComision({
  comision,
  clases,
  evaluaciones,
  alumnos,
  parametros,
  usedCountKeys,
  allowEmptyMarks,
}: BuildCursadasInput): Cursada[] {
  const students = [...alumnos].sort((left, right) =>
    left.legajo.localeCompare(right.legajo, "es", { numeric: true }),
  );
  const counts = pickConditionCounts(
    students.length,
    createRng(`condiciones-${comision.id}`),
    usedCountKeys,
  );
  const targets = createRng(`objetivos-${comision.id}`).shuffle(expandTargets(counts));
  const marksRng = createRng(`marcas-${comision.id}`);
  const notesRng = createRng(`notas-${comision.id}`);
  const usage: SpecialUsage = { tardanzas: new Set(), justificadas: new Set() };
  let emptyMarksAssigned = false;

  return students.map((alumno, index) => {
    const target = targets[index];

    if (target === undefined) {
      throw new Error(`Falta la condición objetivo para ${alumno.apellido}, ${alumno.nombre}.`);
    }

    const useEmptyMarks = allowEmptyMarks && !emptyMarksAssigned && target === "cursando";

    if (useEmptyMarks) {
      emptyMarksAssigned = true;
    }

    const marcas = useEmptyMarks
      ? {}
      : buildMarks(marksRng, clases, target, usage, parametros);
    const notas = useEmptyMarks ? {} : buildNotes(notesRng, evaluaciones, target);
    const derived = deriveCursada({
      clases,
      marcas,
      evaluaciones,
      notas,
      parametros,
    });

    if (derived.condicion !== target) {
      throw new Error(
        `La cursada de ${alumno.apellido}, ${alumno.nombre} en ${comision.id} derivó ${derived.condicion} y se esperaba ${target}.`,
      );
    }

    return {
      id: `cur-${comision.id}-${alumno.id}`,
      alumno: alumno.id,
      comision: comision.id,
      condicion: derived.condicion,
      condicionManual: derived.condicionManual,
      marcas,
      notas,
      resumen: derived.resumen,
    };
  });
}
