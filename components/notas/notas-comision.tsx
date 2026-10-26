"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ListaNotas } from "@/components/notas/lista-notas";
import { TabsEvaluaciones } from "@/components/notas/tabs-evaluaciones";
import { Button } from "@/components/ui/button";
import { getCursadasDeComision, getDocentesLabel, type CursadaConAlumno } from "@/lib/academic";
import { formatAnio, formatFecha } from "@/lib/format";
import { useAcademicStore } from "@/lib/store/academic-store";
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

export function NotasComision({
  comision,
  unidad,
  docentes,
  evaluaciones,
}: {
  comision: Comision;
  unidad: UnidadCurricular;
  docentes: readonly Docente[];
  evaluaciones: readonly Evaluacion[];
}) {
  const { alumnos, cursadas } = useAcademicStore();
  const rows = getCursadasDeComision(cursadas, alumnos, comision.id);
  const [activeId, setActiveId] = useState(evaluaciones[0]?.id ?? "");
  const [notas, setNotas] = useState<Record<string, Record<string, string>>>(() =>
    buildInitialValues(rows, evaluaciones),
  );
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const active = evaluaciones.find((evaluacion) => evaluacion.id === activeId) ?? evaluaciones[0];
  const valores = active === undefined ? {} : (notas[active.id] ?? {});
  const hayErrores = rows.some(({ cursada }) => validateNota(valores[cursada.id] ?? "") !== null);

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
    if (hayErrores) {
      setStatus({ text: "Revisá las notas fuera de rango antes de guardar.", error: true });
      return;
    }

    setStatus({ text: "Notas guardadas", error: false });
  }

  return (
    <div>
      <PageHeader
        title={unidad.nombre}
        description={`${formatAnio(comision.anio)} año · Ciclo lectivo ${comision.cicloLectivo} · ${rows.length} inscriptos · ${getDocentesLabel(docentes)}`}
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
        Carga de notas por evaluación. La condición actual se muestra como referencia y no se
        recalcula en esta pantalla.
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
