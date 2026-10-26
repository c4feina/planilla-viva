"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  AcademicState,
  Alumno,
  CambioAlumno,
  Cursada,
  DocumentoAlumno,
} from "@/lib/types";
import { ACTOR_SECRETARIA } from "@/lib/constantes";
import { CATEGORIA_DOCUMENTO_LABELS } from "@/lib/documentos";

export interface CambioCampo {
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
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
    };

function nombreAlumno(alumno: Alumno): string {
  return `${alumno.apellido}, ${alumno.nombre}`;
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
        alumnos: [...state.alumnos, action.alumno],
        cursadas: [...state.cursadas, ...action.cursadas],
        documentos: state.documentos,
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
  const [state, dispatch] = useReducer(academicReducer, initialState);
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
