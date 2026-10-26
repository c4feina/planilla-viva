"use client";

import { useEffect, useState } from "react";

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
  HorasClase,
  MarcaAsistencia,
  TipoClase,
  UnidadCurricular,
} from "@/lib/types";

export function AsistenciaComision({
  comision,
  unidad,
  docentes,
}: {
  comision: Comision;
  unidad: UnidadCurricular;
  docentes: readonly Docente[];
}) {
  const {
    alumnos,
    cursadas,
    clases: todasLasClases,
    evaluaciones,
    parametros,
  } = useAcademicStore();
  const dispatch = useAcademicDispatch();
  const rows = getCursadasDeComision(cursadas, alumnos, comision.id);
  const clases = todasLasClases
    .filter((clase) => clase.comision === comision.id)
    .sort((left, right) => right.fecha.localeCompare(left.fecha));
  const evaluacionesDeComision = evaluaciones.filter(
    (evaluacion) => evaluacion.comision === comision.id,
  );
  const normalClasses = clases.filter((clase) => clase.tipo === "normal");
  const firstClass = normalClasses[0] ?? clases[0];
  const [selectedClassId, setSelectedClassId] = useState(firstClass?.id ?? "");
  const [fecha, setFecha] = useState(firstClass?.fecha ?? "");
  const [tipo, setTipo] = useState<TipoClase>(firstClass?.tipo ?? "normal");
  const [horas, setHoras] = useState<number>(firstClass?.horas ?? 2);
  const [presence, setPresence] = useState<Record<string, boolean>>(() =>
    buildPresenceFromClass(rows, firstClass?.id),
  );
  const [changed, setChanged] = useState<ReadonlySet<string>>(() => new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const selectedClass = clases.find((clase) => clase.id === selectedClassId);
  const computable = tipo === "normal";
  const presentCount = rows.filter((row) => presence[row.cursada.id] === true).length;

  // Sincroniza el formulario con la clase elegida y con los datos hidratados.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPresence(buildPresenceFromClass(rows, selectedClassId));
    setChanged(new Set());
    setHasChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursadas, selectedClassId]);

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

  function handleClassChange(claseId: string) {
    const clase = clases.find((item) => item.id === claseId);

    if (clase === undefined) {
      return;
    }

    setSelectedClassId(clase.id);
    setFecha(clase.fecha);
    setTipo(clase.tipo);
    setHoras(clase.horas);
    setPresence(buildPresenceFromClass(rows, clase.id));
    setChanged(new Set());
    setHasChanges(false);
    setStatus(null);
  }

  function handleSave() {
    if (selectedClass === undefined) {
      setStatus("Elegí una clase para guardar.");
      return;
    }

    const fechaHora = new Date().toISOString();
    const claseActualizada: Clase = {
      ...selectedClass,
      fecha,
      tipo,
      horas: Math.min(4, Math.max(1, horas)) as HorasClase,
    };
    const cambioDeClase =
      claseActualizada.fecha !== selectedClass.fecha ||
      claseActualizada.tipo !== selectedClass.tipo ||
      claseActualizada.horas !== selectedClass.horas;

    if (cambioDeClase) {
      dispatch({ type: "updateClase", clase: claseActualizada });
    }

    if (!computable) {
      setStatus(
        cambioDeClase
          ? `Clase guardada como ${tipo === "cancelada" ? "cancelada" : "feriado"}.`
          : "No había cambios para guardar.",
      );
      setChanged(new Set());
      setHasChanges(false);
      return;
    }

    const clasesActualizadas = clases.map((clase) =>
      clase.id === claseActualizada.id ? claseActualizada : clase,
    );
    let saved = 0;

    for (const row of rows) {
      if (!changed.has(row.cursada.id)) {
        continue;
      }

      const anterior = row.cursada.marcas[selectedClass.id];
      const siguiente: MarcaAsistencia = presence[row.cursada.id] === true ? "P" : "A";

      if (anterior === siguiente) {
        continue;
      }

      const marcas = { ...row.cursada.marcas, [selectedClass.id]: siguiente };
      const derived = deriveCursada({
        clases: clasesActualizadas,
        marcas,
        evaluaciones: evaluacionesDeComision,
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
        campo: `Asistencia · ${formatFecha(selectedClass.fecha)}`,
        valorAnterior: getMarcaAsistenciaLabel(anterior),
        valorNuevo: getMarcaAsistenciaLabel(siguiente),
      });
      saved += 1;
    }

    if (saved > 0) {
      setStatus(
        `${saved} ${saved === 1 ? "alumno actualizado" : "alumnos actualizados"}. La condición se recalculó.`,
      );
    } else if (cambioDeClase) {
      setStatus("Clase actualizada.");
    } else {
      setStatus("No había cambios para guardar.");
    }

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
        clases={clases}
        selectedClassId={selectedClassId}
        fecha={fecha}
        tipo={tipo}
        horas={horas}
        onClassChange={handleClassChange}
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
