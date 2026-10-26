"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  AcademicState,
  Alumno,
  CambioAlumno,
  CicloLectivo,
  Clase,
  Cursada,
  DocumentoAlumno,
  Evaluacion,
  ParametrosAcademicos,
} from "@/lib/types";
import { ACTOR_SECRETARIA } from "@/lib/constantes";
import { CATEGORIA_DOCUMENTO_LABELS } from "@/lib/documentos";
import { deriveCursada } from "@/lib/mock/derive";

export interface CambioCampo {
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
}

export interface PersistedAcademicState {
  alumnos: Alumno[];
  cursadas: Cursada[];
  historial: CambioAlumno[];
  parametros: ParametrosAcademicos;
  ciclo: CicloLectivo;
  clases?: Clase[];
}

export type AcademicAction =
  | { type: "addAlumno"; alumno: Alumno; cursadas: Cursada[]; fecha: string }
  | { type: "updateAlumno"; alumno: Alumno; cambios: CambioCampo[]; fecha: string }
  | { type: "setAlumnoActivo"; alumnoId: string; activo: boolean; fecha: string }
  | { type: "addDocumento"; documento: DocumentoAlumno }
  | {
      type: "updateCursada";
      cursada: Cursada;
      fecha: string;
      campo: string;
      valorAnterior: string;
      valorNuevo: string;
    }
  | {
      type: "saveNotas";
      cursadaIds: string[];
      evaluacionId: string;
      valores: Record<string, number | undefined>;
      fecha: string;
    }
  | { type: "updateParametros"; parametros: ParametrosAcademicos }
  | { type: "updateCiclo"; ciclo: CicloLectivo }
  | { type: "updateClase"; clase: Clase }
  | { type: "hydrate"; state: PersistedAcademicState }
  | { type: "reset" };

export const ACADEMIC_STORAGE_KEY = "planilla-viva-academic-v2";
const STORAGE_VERSION = 2;

function nombreAlumno(alumno: Alumno): string {
  return `${alumno.apellido}, ${alumno.nombre}`;
}

function groupByComision<T extends { comision: string }>(
  items: readonly T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const group = groups.get(item.comision);

    if (group === undefined) {
      groups.set(item.comision, [item]);
    } else {
      group.push(item);
    }
  }

  return groups;
}

function recomputeCursada(
  cursada: Cursada,
  clases: readonly Clase[],
  evaluaciones: readonly Evaluacion[],
  parametros: ParametrosAcademicos,
): Cursada {
  const derived = deriveCursada({
    clases,
    marcas: cursada.marcas,
    evaluaciones,
    notas: cursada.notas,
    parametros,
  });

  return {
    ...cursada,
    resumen: derived.resumen,
    condicion: cursada.condicionManual ? cursada.condicion : derived.condicion,
  };
}

function recomputeAll(
  cursadas: readonly Cursada[],
  clases: readonly Clase[],
  evaluaciones: readonly Evaluacion[],
  parametros: ParametrosAcademicos,
): Cursada[] {
  const clasesPorComision = groupByComision(clases);
  const evaluacionesPorComision = groupByComision(evaluaciones);

  return cursadas.map((cursada) =>
    recomputeCursada(
      cursada,
      clasesPorComision.get(cursada.comision) ?? [],
      evaluacionesPorComision.get(cursada.comision) ?? [],
      parametros,
    ),
  );
}

function buildCambios(
  state: AcademicState,
  alumnoId: string,
  fecha: string,
  cambios: readonly CambioCampo[],
): CambioAlumno[] {
  const alumno = state.alumnos.find((item) => item.id === alumnoId);

  if (alumno === undefined) {
    return [];
  }

  return cambios.map((cambio, index) => ({
    id: `hist-${state.historial.length + index + 1}`,
    fecha,
    actor: ACTOR_SECRETARIA,
    alumnoId,
    alumnoNombre: nombreAlumno(alumno),
    campo: cambio.campo,
    valorAnterior: cambio.valorAnterior,
    valorNuevo: cambio.valorNuevo,
  }));
}

export function academicReducer(state: AcademicState, action: AcademicAction): AcademicState {
  switch (action.type) {
    case "addAlumno":
      return {
        ...state,
        alumnos: [...state.alumnos, action.alumno],
        cursadas: [...state.cursadas, ...action.cursadas],
        historial: [
          ...state.historial,
          {
            id: `hist-${state.historial.length + 1}`,
            fecha: action.fecha,
            actor: ACTOR_SECRETARIA,
            alumnoId: action.alumno.id,
            alumnoNombre: nombreAlumno(action.alumno),
            campo: "Alta",
            valorAnterior: "—",
            valorNuevo: "Alumno activo",
          },
        ],
      };

    case "updateAlumno": {
      const actual = state.alumnos.find((alumno) => alumno.id === action.alumno.id);

      if (actual === undefined) {
        return state;
      }

      return {
        ...state,
        alumnos: state.alumnos.map((alumno) =>
          alumno.id === action.alumno.id ? action.alumno : alumno,
        ),
        historial: [
          ...state.historial,
          ...buildCambios(state, action.alumno.id, action.fecha, action.cambios),
        ],
      };
    }

    case "setAlumnoActivo": {
      const actual = state.alumnos.find((alumno) => alumno.id === action.alumnoId);

      if (actual === undefined) {
        return state;
      }

      return {
        ...state,
        alumnos: state.alumnos.map((alumno) =>
          alumno.id === action.alumnoId ? { ...alumno, activo: action.activo } : alumno,
        ),
        historial: [
          ...state.historial,
          ...buildCambios(state, action.alumnoId, action.fecha, [
            {
              campo: "Estado",
              valorAnterior: action.activo ? "De baja" : "Activo",
              valorNuevo: action.activo ? "Activo" : "De baja",
            },
          ]),
        ],
      };
    }

    case "updateCursada": {
      const actual = state.cursadas.find((cursada) => cursada.id === action.cursada.id);

      if (actual === undefined) {
        return state;
      }

      const alumno = state.alumnos.find((item) => item.id === action.cursada.alumno);

      if (alumno === undefined) {
        return state;
      }

      return {
        ...state,
        cursadas: state.cursadas.map((cursada) =>
          cursada.id === action.cursada.id ? action.cursada : cursada,
        ),
        historial: [
          ...state.historial,
          {
            id: `hist-${state.historial.length + 1}`,
            fecha: action.fecha,
            actor: ACTOR_SECRETARIA,
            alumnoId: alumno.id,
            alumnoNombre: nombreAlumno(alumno),
            campo: action.campo,
            valorAnterior: action.valorAnterior,
            valorNuevo: action.valorNuevo,
          },
        ],
      };
    }

    case "saveNotas": {
      const evaluacion = state.evaluaciones.find(
        (item) => item.id === action.evaluacionId,
      );

      if (evaluacion === undefined) {
        return state;
      }

      const clasesPorComision = groupByComision(state.clases);
      const evaluacionesPorComision = groupByComision(state.evaluaciones);
      const historial = [...state.historial];
      const ids = new Set(action.cursadaIds);
      let huboCambios = false;

      const cursadas = state.cursadas.map((cursada) => {
        if (!ids.has(cursada.id)) {
          return cursada;
        }

        const anterior = cursada.notas[evaluacion.id];
        const siguiente = action.valores[cursada.id];

        if (anterior === siguiente) {
          return cursada;
        }

        const notas = { ...cursada.notas };

        if (siguiente === undefined) {
          delete notas[evaluacion.id];
        } else {
          notas[evaluacion.id] = siguiente;
        }

        const derivada = recomputeCursada(
          { ...cursada, notas },
          clasesPorComision.get(cursada.comision) ?? [],
          evaluacionesPorComision.get(cursada.comision) ?? [],
          state.parametros,
        );
        const alumno = state.alumnos.find((item) => item.id === cursada.alumno);

        if (alumno !== undefined) {
          historial.push({
            id: `hist-${historial.length + 1}`,
            fecha: action.fecha,
            actor: ACTOR_SECRETARIA,
            alumnoId: alumno.id,
            alumnoNombre: nombreAlumno(alumno),
            campo: `Nota · ${evaluacion.nombre}`,
            valorAnterior: anterior === undefined ? "Sin nota" : String(anterior),
            valorNuevo: siguiente === undefined ? "Sin nota" : String(siguiente),
          });
        }

        huboCambios = true;
        return derivada;
      });

      return huboCambios ? { ...state, cursadas, historial } : state;
    }

    case "updateParametros": {
      const cursadas = recomputeAll(
        state.cursadas,
        state.clases,
        state.evaluaciones,
        action.parametros,
      );

      return { ...state, parametros: action.parametros, cursadas };
    }

    case "updateCiclo":
      return { ...state, ciclo: action.ciclo };

    case "updateClase": {
      const clases = state.clases.map((clase) =>
        clase.id === action.clase.id ? action.clase : clase,
      );
      const cursadas = recomputeAll(
        state.cursadas,
        clases,
        state.evaluaciones,
        state.parametros,
      );

      return { ...state, clases, cursadas };
    }

    case "hydrate": {
      const clases = action.state.clases ?? state.clases;
      const cursadas = recomputeAll(
        action.state.cursadas,
        clases,
        state.evaluaciones,
        action.state.parametros,
      );

      return {
        ...state,
        ...action.state,
        cursadas,
        clases,
        evaluaciones: state.evaluaciones,
        documentos: state.documentos,
      };
    }

    case "addDocumento": {
      const alumno = state.alumnos.find((item) => item.id === action.documento.alumnoId);

      if (alumno === undefined) {
        return state;
      }

      return {
        ...state,
        documentos: [...state.documentos, action.documento],
        historial: [
          ...state.historial,
          {
            id: `hist-${state.historial.length + 1}`,
            fecha: action.documento.fecha,
            actor: ACTOR_SECRETARIA,
            alumnoId: alumno.id,
            alumnoNombre: nombreAlumno(alumno),
            campo: "Documento",
            valorAnterior: "—",
            valorNuevo: `${CATEGORIA_DOCUMENTO_LABELS[action.documento.categoria]}: ${action.documento.nombre}`,
          },
        ],
      };
    }

    case "reset":
      return state;

    default:
      return state;
  }
}

interface AcademicStoreValue {
  state: AcademicState;
  dispatch: Dispatch<AcademicAction>;
}

const AcademicStoreContext = createContext<AcademicStoreValue | null>(null);

export function AcademicStoreProvider({
  initialState,
  children,
}: {
  initialState: AcademicState;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    (current: AcademicState, action: AcademicAction): AcademicState =>
      action.type === "reset" ? initialState : academicReducer(current, action),
    initialState,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ACADEMIC_STORAGE_KEY);

      if (raw !== null) {
        const parsed = JSON.parse(raw) as {
          version?: number;
          state?: PersistedAcademicState;
        };

        if (parsed.version === STORAGE_VERSION && parsed.state !== undefined) {
          dispatch({ type: "hydrate", state: parsed.state });
        }
      }
    } catch {
      // Si el navegador bloquea el almacenamiento, la demo sigue en memoria.
    }

    // Habilita la persistencia recién cuando el estado guardado ya está aplicado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      const persisted: PersistedAcademicState = {
        alumnos: state.alumnos,
        cursadas: state.cursadas,
        historial: state.historial,
        parametros: state.parametros,
        ciclo: state.ciclo,
        clases: state.clases,
      };

      window.localStorage.setItem(
        ACADEMIC_STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, state: persisted }),
      );
    } catch {
      // Sin persistencia, la demo sigue funcionando en memoria.
    }
  }, [state, hydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AcademicStoreContext.Provider value={value}>{children}</AcademicStoreContext.Provider>;
}

function useStore(): AcademicStoreValue {
  const value = useContext(AcademicStoreContext);

  if (value === null) {
    throw new Error("useAcademicStore debe usarse dentro de AcademicStoreProvider.");
  }

  return value;
}

export function useAcademicStore(): AcademicState {
  return useStore().state;
}

export function useAcademicDispatch(): Dispatch<AcademicAction> {
  return useStore().dispatch;
}
