"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ListaNotas } from "@/components/notas/lista-notas";
import { TabsEvaluaciones } from "@/components/notas/tabs-evaluaciones";
import { Button } from "@/components/ui/button";
import { getCursadasDeComision, getDocentesLabel, type CursadaConAlumno } from "@/lib/academic";
import { formatAnio, formatFecha } from "@/lib/format";
import { useAcademicDispatch, useAcademicStore } from "@/lib/store/academic-store";
import type { Comision, Docente, Evaluacion, UnidadCurricular } from "@/lib/types";
import { validateNota } from "@/lib/validaciones";

function buildInitialValues(
  rows: readonly CursadaConAlumno[],
  evaluaciones: readonly Evaluacion[],
): Record<string, Record<string, string>> {
  const initial: Record<string, Record<string, string>> = {};

  for (const evaluacion of evaluaciones) {
    const porCursada: Record<string, string> = {};

    for (const { cursada } of rows) {
      const nota = cursada.notas[evaluacion.id];
      porCursada[cursada.id] = nota === undefined ? "" : String(nota);
    }

    initial[evaluacion.id] = porCursada;
  }

  return initial;
}

function parseNota(value: string): number | undefined {
  const trimmed = value.trim();

  if (trimmed === "") {
    return undefined;
  }

  return Number.parseInt(trimmed, 10);
}

export function NotasComision({
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
    evaluaciones: todasLasEvaluaciones,
    ciclo,
  } = useAcademicStore();
  const dispatch = useAcademicDispatch();
  const rows = getCursadasDeComision(cursadas, alumnos, comision.id);
  const evaluaciones = todasLasEvaluaciones
    .filter((evaluacion) => evaluacion.comision === comision.id)
    .sort((left, right) => left.fecha.localeCompare(right.fecha));
  const [activeId, setActiveId] = useState(evaluaciones[0]?.id ?? "");
  const [notas, setNotas] = useState<Record<string, Record<string, string>>>(() =>
    buildInitialValues(rows, evaluaciones),
  );
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const active = evaluaciones.find((evaluacion) => evaluacion.id === activeId) ?? evaluaciones[0];
  const valores = active === undefined ? {} : (notas[active.id] ?? {});
  const hayErrores = rows.some(({ cursada }) => validateNota(valores[cursada.id] ?? "") !== null);

  useEffect(() => {
    const evaluacionesActuales = todasLasEvaluaciones
      .filter((evaluacion) => evaluacion.comision === comision.id)
      .sort((left, right) => left.fecha.localeCompare(right.fecha));
    const filasActuales = getCursadasDeComision(cursadas, alumnos, comision.id);

    // Sincroniza el borrador con las notas guardadas y con la hidratación inicial.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotas(buildInitialValues(filasActuales, evaluacionesActuales));
  }, [cursadas, alumnos, todasLasEvaluaciones, comision.id]);

  function handleChange(cursadaId: string, value: string) {
    if (active === undefined) {
      return;
    }

    setNotas((current) => ({
      ...current,
      [active.id]: { ...current[active.id], [cursadaId]: value },
    }));
    setStatus(null);
  }

  function handleSave() {
    if (active === undefined) {
      return;
    }

    if (hayErrores) {
      setStatus({ text: "Revisá las notas fuera de rango antes de guardar.", error: true });
      return;
    }

    const valoresNumericos: Record<string, number | undefined> = {};

    for (const { cursada } of rows) {
      valoresNumericos[cursada.id] = parseNota(valores[cursada.id] ?? "");
    }

    const cambiadas = rows.filter(({ cursada }) => {
      const anterior = cursada.notas[active.id];
      const siguiente = valoresNumericos[cursada.id];
      return anterior !== siguiente;
    });

    if (cambiadas.length === 0) {
      setStatus({ text: "No había cambios para guardar.", error: false });
      return;
    }

    dispatch({
      type: "saveNotas",
      cursadaIds: cambiadas.map(({ cursada }) => cursada.id),
      evaluacionId: active.id,
      valores: valoresNumericos,
      fecha: new Date().toISOString(),
    });

    setStatus({
      text: `Notas guardadas · ${cambiadas.length} ${
        cambiadas.length === 1 ? "alumno actualizado" : "alumnos actualizados"
      }. La condición se recalculó.`,
      error: false,
    });
  }

  return (
    <div>
      <PageHeader
        title={unidad.nombre}
        description={`${formatAnio(comision.anio)} año · Ciclo lectivo ${ciclo.anio} · ${rows.length} inscriptos · ${getDocentesLabel(docentes)}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/comisiones/${comision.id}/planilla`}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a la planilla
            </Link>
          </Button>
        }
      />

      <p className="mb-4 text-sm text-muted-foreground">
        Cargá las notas de cada evaluación. Al guardar, la condición de cada alumno se recalcula con
        la asistencia y las notas vigentes.
      </p>

      {evaluaciones.length === 0 || active === undefined ? (
        <EmptyState
          titulo="La materia no tiene evaluaciones"
          descripcion="Cuando se definan evaluaciones van a aparecer en esta pantalla."
        />
      ) : (
        <>
          <TabsEvaluaciones
            evaluaciones={evaluaciones}
            activeId={active.id}
            onChange={(id) => {
              setActiveId(id);
              setStatus(null);
            }}
          />

          <div
            id={`panel-${active.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${active.id}`}
            tabIndex={0}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Fecha: </span>
                {formatFecha(active.fecha)}
              </p>
              <p>{active.obligatoria ? "Obligatoria" : "No obligatoria"}</p>
            </div>

            {rows.length === 0 ? (
              <EmptyState
                titulo="No hay alumnos activos"
                descripcion="La materia no tiene alumnos inscriptos para cargar notas."
              />
            ) : (
              <>
                <ListaNotas
                  rows={rows}
                  evaluacionNombre={active.nombre}
                  valores={valores}
                  onChange={handleChange}
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button type="button" onClick={handleSave}>
                    Guardar notas
                  </Button>
                  {status === null ? null : (
                    <p
                      role="status"
                      className={
                        status.error
                          ? "text-sm font-medium text-destructive"
                          : "text-sm font-medium text-emerald-700 dark:text-emerald-400"
                      }
                    >
                      {status.text}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
