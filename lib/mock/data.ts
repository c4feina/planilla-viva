import type { AcademicState } from "@/lib/types";
import { PARAMETROS_ACADEMICOS } from "@/lib/mock/catalog";
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

export const initialAcademicState: AcademicState = {
  alumnos,
  cursadas,
  documentos: [],
  historial: [],
};
