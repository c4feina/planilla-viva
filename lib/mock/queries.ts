import type { Clase, Comision, Docente, Evaluacion, UnidadCurricular } from "@/lib/types";
import {
  clases as allClases,
  comisiones,
  docentes as allDocentes,
  evaluaciones as allEvaluaciones,
  unidadesCurriculares,
} from "@/lib/mock/data";

export interface ComisionDetalle {
  comision: Comision;
  unidad: UnidadCurricular;
  docentes: Docente[];
  clases: Clase[];
  evaluaciones: Evaluacion[];
}

export function getComisionDetalle(comisionId: string): ComisionDetalle | null {
  const comision = comisiones.find((item) => item.id === comisionId);

  if (comision === undefined) {
    return null;
  }

  const unidad = unidadesCurriculares.find((item) => item.id === comision.unidadCurricular);

  if (unidad === undefined) {
    return null;
  }

  const docentes = comision.docentes
    .map((docenteId) => allDocentes.find((docente) => docente.id === docenteId))
    .filter((docente): docente is Docente => docente !== undefined);
  const clases = allClases
    .filter((clase) => clase.comision === comision.id)
    .sort((left, right) => left.fecha.localeCompare(right.fecha));
  const evaluaciones = allEvaluaciones
    .filter((evaluacion) => evaluacion.comision === comision.id)
    .sort((left, right) => left.fecha.localeCompare(right.fecha));

  return { comision, unidad, docentes, clases, evaluaciones };
}
