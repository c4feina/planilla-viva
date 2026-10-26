export type Condicion = "cursando" | "regular" | "libre" | "aprobada" | "recursa";

export type MarcaAsistencia = "P" | "A" | "J" | "T";

export type TipoClase = "normal" | "cancelada" | "feriado";

export type TipoEvaluacion = "parcial" | "tp" | "recuperatorio" | "final";

export type Regimen = "anual" | "cuatrimestral";

export type AnioCursada = 1 | 2 | 3 | 4;

export type HorasClase = 1 | 2 | 3 | 4;

export type CategoriaDocumento = "dni" | "constancia" | "cuota" | "analitico" | "otro";

export interface Docente {
  id: string;
  apellido: string;
  nombre: string;
}

export interface Alumno {
  id: string;
  legajo: string;
  dni: string;
  apellido: string;
  nombre: string;
  anioCursada: AnioCursada;
  cuotaAlDia: boolean;
  activo: boolean;
}

export interface UnidadCurricular {
  id: string;
  nombre: string;
  anio: AnioCursada;
  horasTotales: number;
  regimen: Regimen;
}

export interface Comision {
  id: string;
  unidadCurricular: string;
  anio: AnioCursada;
  docentes: string[];
  cicloLectivo: number;
  asistenciaPromedio: number;
}

export interface Clase {
  id: string;
  comision: string;
  fecha: string;
  horas: HorasClase;
  tipo: TipoClase;
}

export interface Evaluacion {
  id: string;
  comision: string;
  tipo: TipoEvaluacion;
  nombre: string;
  fecha: string;
  obligatoria: boolean;
}

export interface ParametrosAcademicos {
  porcentajeMinimoAsistencia: number;
  notaAprobacion: number;
  notaPromocion: number;
  justificadaComputa: boolean;
  tardanzaFraccion: number;
}

export interface ResumenAsistencia {
  horasDictadas: number;
  horasAsistidas: number;
  porcentaje: number | null;
}

export interface Cursada {
  id: string;
  alumno: string;
  comision: string;
  condicion: Condicion;
  condicionManual: boolean;
  marcas: Record<string, MarcaAsistencia>;
  notas: Record<string, number>;
  resumen: ResumenAsistencia;
}

export interface CambioAlumno {
  id: string;
  fecha: string;
  actor: string;
  alumnoId: string;
  alumnoNombre: string;
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
}

export interface DocumentoAlumno {
  id: string;
  alumnoId: string;
  categoria: CategoriaDocumento;
  nombre: string;
  tipo: string;
  tamanio: number;
  fecha: string;
  archivo: File;
}

export interface AcademicState {
  alumnos: Alumno[];
  cursadas: Cursada[];
  documentos: DocumentoAlumno[];
  historial: CambioAlumno[];
}
