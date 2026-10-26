import type { AcademicState, CicloLectivo } from "@/lib/types";
import {
  CICLO_LECTIVO,
  CICLO_LECTIVO_FIN,
  CICLO_LECTIVO_INICIO,
  PARAMETROS_ACADEMICOS,
} from "@/lib/mock/catalog";
import { buildMockDataset } from "@/lib/mock/generate";

const dataset = buildMockDataset();

export const docentes = dataset.docentes;
export const unidadesCurriculares = dataset.unidades;
export const comisiones = dataset.comisiones;
export const clases = dataset.clases;
export const evaluaciones = dataset.evaluaciones;
export const alumnos = dataset.alumnos;
export const cursadas = dataset.cursadas;
export const parametrosAcademicos = PARAMETROS_ACADEMICOS;
export const cicloLectivo: CicloLectivo = {
  anio: CICLO_LECTIVO,
  inicio: CICLO_LECTIVO_INICIO,
  fin: CICLO_LECTIVO_FIN,
};

export const initialAcademicState: AcademicState = {
  alumnos,
  cursadas,
  documentos: [],
  historial: [],
  clases,
  evaluaciones,
  parametros: parametrosAcademicos,
  ciclo: cicloLectivo,
};
