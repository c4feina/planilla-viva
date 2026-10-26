import type { Clase, Comision, Docente, Evaluacion, UnidadCurricular } from "@/lib/types";
import { CICLO_LECTIVO, DOCENTES, UNIDADES } from "@/lib/mock/catalog";
import { createRng } from "@/lib/mock/random";
import { buildClases, buildEvaluaciones } from "@/lib/mock/schedule";

export function buildDocentes(): Docente[] {
  return DOCENTES.map((docente) => ({
    id: docente.id,
    apellido: docente.apellido,
    nombre: docente.nombre,
  }));
}

export function buildUnidades(): UnidadCurricular[] {
  return UNIDADES.map((unidad) => ({ ...unidad }));
}

function assignDocentes(): Map<string, string[]> {
  const counts = new Map(DOCENTES.map((docente) => [docente.id, 0]));
  const assignments = new Map<string, string[]>();

  for (const unidad of UNIDADES) {
    const fixed = DOCENTES.filter((docente) => docente.unidadFija === unidad.id);

    if (fixed.length > 0) {
      const ids = fixed.map((docente) => docente.id);
      assignments.set(unidad.id, ids);

      for (const id of ids) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
  }

  const remainingUnits = UNIDADES.filter((unidad) => !assignments.has(unidad.id));

  for (const unidad of remainingUnits) {
    const candidates = DOCENTES.filter((docente) => (counts.get(docente.id) ?? 0) < 3);
    const minimum = Math.min(...candidates.map((docente) => counts.get(docente.id) ?? 0));
    const options = candidates.filter((docente) => (counts.get(docente.id) ?? 0) === minimum);
    const rng = createRng(`docentes-${unidad.id}`);
    const chosen = rng.pick(options);

    assignments.set(unidad.id, [chosen.id]);
    counts.set(chosen.id, (counts.get(chosen.id) ?? 0) + 1);
  }

  return assignments;
}

export function buildComisiones(unidades: readonly UnidadCurricular[]): Comision[] {
  const assignments = assignDocentes();

  return unidades.map((unidad, index) => {
    const docentes = assignments.get(unidad.id);

    if (docentes === undefined || docentes.length === 0) {
      throw new Error(`La unidad ${unidad.nombre} no tiene docentes asignados.`);
    }

    return {
      id: `com-${String(index + 1).padStart(2, "0")}`,
      unidadCurricular: unidad.id,
      anio: unidad.anio,
      docentes,
      cicloLectivo: CICLO_LECTIVO,
      asistenciaPromedio: 0,
    };
  });
}

export function buildClasesDeComisiones(comisiones: readonly Comision[]): Clase[] {
  return comisiones.flatMap((comision, index) =>
    buildClases(comision.id, index % 5, createRng(`clases-${comision.id}`)),
  );
}

export function buildEvaluacionesDeComisiones(comisiones: readonly Comision[]): Evaluacion[] {
  return comisiones.flatMap((comision) => buildEvaluaciones(comision.id));
}
