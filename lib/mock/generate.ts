import type {
  Alumno,
  Clase,
  Comision,
  Cursada,
  Evaluacion,
  UnidadCurricular,
} from "@/lib/types";
import { PARAMETROS_ACADEMICOS } from "@/lib/mock/catalog";
import {
  buildClasesDeComisiones,
  buildComisiones,
  buildDocentes,
  buildEvaluacionesDeComisiones,
  buildUnidades,
} from "@/lib/mock/commissions";
import { buildCursadasForComision } from "@/lib/mock/cursadas";
import { buildAlumnos, buildRecursantes } from "@/lib/mock/students";

export interface MockDataset {
  docentes: ReturnType<typeof buildDocentes>;
  unidades: UnidadCurricular[];
  comisiones: Comision[];
  clases: Clase[];
  evaluaciones: Evaluacion[];
  alumnos: Alumno[];
  cursadas: Cursada[];
}

function groupBy<T>(items: readonly T[], getKey: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key);

    if (group === undefined) {
      groups.set(key, [item]);
    } else {
      group.push(item);
    }
  }

  return groups;
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function averageAttendance(cursadas: readonly Cursada[], comisionId: string): number {
  const percentages = cursadas
    .filter((cursada) => cursada.comision === comisionId)
    .map((cursada) => cursada.resumen.porcentaje)
    .filter((percentage): percentage is number => percentage !== null);

  if (percentages.length === 0) {
    return 0;
  }

  const total = percentages.reduce((sum, percentage) => sum + percentage, 0);
  return roundOneDecimal(total / percentages.length);
}

function buildStudentsByCommission(
  comisiones: readonly Comision[],
  alumnos: readonly Alumno[],
  recursantes: ReadonlyMap<string, string>,
): Map<string, Alumno[]> {
  const studentsByCommission = new Map<string, Alumno[]>();

  for (const comision of comisiones) {
    const cohort = alumnos.filter((alumno) => alumno.anioCursada === comision.anio);
    const extraIds = [...recursantes.entries()]
      .filter(([, unidadId]) => unidadId === comision.unidadCurricular)
      .map(([alumnoId]) => alumnoId);
    const extras = extraIds
      .map((alumnoId) => alumnos.find((alumno) => alumno.id === alumnoId))
      .filter((alumno): alumno is Alumno => alumno !== undefined);

    studentsByCommission.set(comision.id, [...cohort, ...extras]);
  }

  return studentsByCommission;
}

export function buildMockDataset(): MockDataset {
  const alumnos = buildAlumnos();
  const recursantes = buildRecursantes(alumnos);
  const docentes = buildDocentes();
  const unidades = buildUnidades();
  const comisionesBase = buildComisiones(unidades);
  const clases = buildClasesDeComisiones(comisionesBase);
  const evaluaciones = buildEvaluacionesDeComisiones(comisionesBase);
  const classesByCommission = groupBy(clases, (clase) => clase.comision);
  const evaluationsByCommission = groupBy(evaluaciones, (evaluacion) => evaluacion.comision);
  const studentsByCommission = buildStudentsByCommission(comisionesBase, alumnos, recursantes);
  const usedCountKeys = new Set<string>();
  const cursadas: Cursada[] = [];

  for (const [index, comision] of comisionesBase.entries()) {
    const commissionClasses = classesByCommission.get(comision.id);
    const commissionEvaluations = evaluationsByCommission.get(comision.id);
    const commissionStudents = studentsByCommission.get(comision.id);

    if (
      commissionClasses === undefined ||
      commissionEvaluations === undefined ||
      commissionStudents === undefined
    ) {
      throw new Error(`Faltan datos estructurales para la comisión ${comision.id}.`);
    }

    cursadas.push(
      ...buildCursadasForComision({
        comision,
        clases: commissionClasses,
        evaluaciones: commissionEvaluations,
        alumnos: commissionStudents,
        parametros: PARAMETROS_ACADEMICOS,
        usedCountKeys,
        allowEmptyMarks: index === 0,
      }),
    );
  }

  const comisiones = comisionesBase.map((comision) => ({
    ...comision,
    asistenciaPromedio: averageAttendance(cursadas, comision.id),
  }));

  return {
    docentes,
    unidades,
    comisiones,
    clases,
    evaluaciones,
    alumnos,
    cursadas,
  };
}
