"use client";

import { useState } from "react";

import { BarraGuardado } from "@/components/asistencia/barra-guardado";
import { ControlesClase } from "@/components/asistencia/controles-clase";
import { EncabezadoAsistencia } from "@/components/asistencia/encabezado-asistencia";
import { ListaAsistencia } from "@/components/asistencia/lista-asistencia";
import { ResumenAsistencia } from "@/components/asistencia/resumen-asistencia";
import { EmptyState } from "@/components/empty-state";
import { buildPresenceFromClass, getCursadasDeComision } from "@/lib/academic";
import { getMarcaAsistenciaLabel } from "@/lib/asistencia";
import { formatFecha } from "@/lib/format";
import { deriveCursada } from "@/lib/mock/derive";
import { useAcademicDispatch, useAcademicStore } from "@/lib/store/academic-store";
import type {
  Clase,
  Comision,
  Docente,
  Evaluacion,
  MarcaAsistencia,
  ParametrosAcademicos,
  TipoClase,
  UnidadCurricular,
} from "@/lib/types";

export function AsistenciaComision({
  comision,
  unidad,
  docentes,
  clases,
  evaluaciones,
  parametros,
}: {
  comision: Comision;
  unidad: UnidadCurricular;
  docentes: readonly Docente[];
  clases: readonly Clase[];
  evaluaciones: readonly Evaluacion[];
  parametros: ParametrosAcademicos;
}) {
  const { alumnos, cursadas } = useAcademicStore();
  const dispatch = useAcademicDispatch();
  const rows = getCursadasDeComision(cursadas, alumnos, comision.id);
  const lastNormalClass = [...clases].reverse().find((clase) => clase.tipo === "normal");
  const [fecha, setFecha] = useState(lastNormalClass?.fecha ?? "");
  const [tipo, setTipo] = useState<TipoClase>(lastNormalClass?.tipo ?? "normal");
  const [horas, setHoras] = useState<number>(lastNormalClass?.horas ?? 2);
  const [presence, setPresence] = useState<Record<string, boolean>>(() =>
    buildPresenceFromClass(rows, lastNormalClass?.id),
  );
  const [changed, setChanged] = useState<ReadonlySet<string>>(() => new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const computable = tipo === "normal";
  const presentCount = rows.filter((row) => presence[row.cursada.id] === true).length;

  function markChanged(cursadaId?: string) {
    setHasChanges(true);
    setStatus(null);

    if (cursadaId !== undefined) {
      setChanged((current) => {
        const next = new Set(current);
        next.add(cursadaId);
        return next;
      });
    }
  }

  function toggleStudent(cursadaId: string) {
    setPresence((current) => ({ ...current, [cursadaId]: current[cursadaId] !== true }));
    markChanged(cursadaId);
  }

  function setAll(value: boolean) {
    const next: Record<string, boolean> = {};
    const nextChanged = new Set<string>();

    for (const row of rows) {
      next[row.cursada.id] = value;
      nextChanged.add(row.cursada.id);
    }

    setPresence(next);
    setChanged(nextChanged);
    markChanged();
  }

  function handleSave() {
    if (!computable) {
      setStatus(
        `Clase guardada como ${tipo === "cancelada" ? "cancelada" : "feriado"}`,
      );
      setChanged(new Set());
      setHasChanges(false);
      return;
    }

    if (lastNormalClass === undefined) {
      setStatus("No hay una clase para guardar.");
      return;
    }

    const fechaHora = new Date().toISOString();
    let saved = 0;

    for (const row of rows) {
      if (!changed.has(row.cursada.id)) {
        continue;
      }

      const anterior = row.cursada.marcas[lastNormalClass.id];
      const siguiente: MarcaAsistencia = presence[row.cursada.id] === true ? "P" : "A";

      if (anterior === siguiente) {
        continue;
      }

      const marcas = { ...row.cursada.marcas, [lastNormalClass.id]: siguiente };
      const derived = deriveCursada({
        clases,
        marcas,
        evaluaciones,
        notas: row.cursada.notas,
        parametros,
      });
      const condicion = row.cursada.condicionManual ? row.cursada.condicion : derived.condicion;

      dispatch({
        type: "updateCursada",
        cursada: {
          ...row.cursada,
          marcas,
          resumen: derived.resumen,
          condicion,
          condicionManual: row.cursada.condicionManual,
        },
        fecha: fechaHora,
        campo: `Asistencia · ${formatFecha(lastNormalClass.fecha)}`,
        valorAnterior: getMarcaAsistenciaLabel(anterior),
        valorNuevo: getMarcaAsistenciaLabel(siguiente),
      });
      saved += 1;
    }

    setStatus(saved > 0 ? "Asistencia guardada" : "No había cambios para guardar.");
    setChanged(new Set());
    setHasChanges(false);
  }

  const saveLabel = computable
    ? "Guardar asistencia"
    : tipo === "cancelada"
      ? "Guardar como cancelada"
      : "Guardar como feriado";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 pb-32">
      <EncabezadoAsistencia comision={comision} unidad={unidad} docentes={docentes} />

      <ControlesClase
        fecha={fecha}
        tipo={tipo}
        horas={horas}
        onFechaChange={(value) => {
          setFecha(value);
          markChanged();
        }}
        onTipoChange={(value) => {
          setTipo(value);
          markChanged();
        }}
        onHorasChange={(value) => {
          setHoras(value);
          markChanged();
        }}
      />

      {!computable ? (
        <p className="mb-4 border-l-2 border-amber-500 bg-background px-3 py-2 text-sm text-amber-900 dark:text-amber-300">
          Esta clase no computa para la asistencia.
        </p>
      ) : null}

      <ResumenAsistencia
        presentCount={presentCount}
        total={rows.length}
        computable={computable}
        onSetAll={setAll}
      />

      {rows.length === 0 ? (
        <EmptyState
          titulo="No hay alumnos activos"
          descripcion="La materia no tiene alumnos inscriptos para tomar asistencia."
        />
      ) : (
        <ListaAsistencia
          rows={rows}
          presence={presence}
          disabled={!computable}
          onToggle={toggleStudent}
        />
      )}

      <BarraGuardado
        presentCount={presentCount}
        total={rows.length}
        horas={horas}
        fecha={fecha}
        status={status}
        saveLabel={saveLabel}
        hasChanges={hasChanges}
        onSave={handleSave}
      />
    </div>
  );
}
