"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { BookOpen, FileText, History, UserRound, Wallet } from "lucide-react";

import { DatosAlumno } from "@/components/alumnos/datos-alumno";
import { DocumentosAlumno } from "@/components/alumnos/documentos-alumno";
import { HistorialAlumno } from "@/components/alumnos/historial-alumno";
import { MetricasAlumno } from "@/components/alumnos/metricas-alumno";
import { SituacionAlumno } from "@/components/alumnos/situacion-alumno";
import { formatNumero } from "@/lib/format";
import type { SituacionAlumno as SituacionAlumnoRow } from "@/lib/selectores";
import type { Alumno, CambioAlumno, Condicion } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "resumen", label: "Resumen", icon: UserRound },
  { id: "materias", label: "Materias", icon: BookOpen },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "historial", label: "Historial", icon: History },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AlertaCuota() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-md border border-border border-l-4 border-l-destructive bg-destructive/5 px-4 py-3">
      <Wallet className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">Cuota pendiente</p>
        <p className="mt-0.5 text-xs text-pretty text-muted-foreground">
          Administración marcó la cuota como no al día. Este estado no condiciona la regularidad
          académica.
        </p>
      </div>
    </div>
  );
}

export function FichaTabs({
  alumno,
  totalCursadas,
  condiciones,
  situacion,
  cambios,
  documentosCount,
}: {
  alumno: Alumno;
  totalCursadas: number;
  condiciones: Record<Condicion, number>;
  situacion: readonly SituacionAlumnoRow[];
  cambios: readonly CambioAlumno[];
  documentosCount: number;
}) {
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [active, setActive] = useState<TabId>("resumen");

  function tabDomId(tabId: TabId): string {
    return `${baseId}-tab-${tabId}`;
  }

  function panelDomId(tabId: TabId): string {
    return `${baseId}-panel-${tabId}`;
  }

  function getCount(tabId: TabId): number | undefined {
    if (tabId === "materias") {
      return situacion.length;
    }

    if (tabId === "documentos") {
      return documentosCount;
    }

    if (tabId === "historial") {
      return cambios.length;
    }

    return undefined;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const key = event.key;

    if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Home" && key !== "End") {
      return;
    }

    event.preventDefault();

    let nextIndex = index;

    if (key === "ArrowRight") {
      nextIndex = (index + 1) % TABS.length;
    }

    if (key === "ArrowLeft") {
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    }

    if (key === "Home") {
      nextIndex = 0;
    }

    if (key === "End") {
      nextIndex = TABS.length - 1;
    }

    const nextTab = TABS[nextIndex];

    if (nextTab === undefined) {
      return;
    }

    setActive(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div>
      <div className="sticky top-16 z-20 mb-6 border-b border-border bg-background md:top-0">
        <div
          role="tablist"
          aria-label="Secciones de la ficha del alumno"
          className="flex gap-1 overflow-x-auto"
        >
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const selected = active === tab.id;
            const count = getCount(tab.id);

            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={tabDomId(tab.id)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelDomId(tab.id)}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  "inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                  selected
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {tab.label}
                {count === undefined ? null : (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs tabular-nums",
                      selected
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {formatNumero(count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={panelDomId(tab.id)}
          aria-labelledby={tabDomId(tab.id)}
          hidden={active !== tab.id}
          tabIndex={0}
          className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {tab.id === "resumen" ? (
            <>
              {alumno.cuotaAlDia ? null : <AlertaCuota />}
              <DatosAlumno alumno={alumno} />
              <MetricasAlumno total={totalCursadas} condiciones={condiciones} />
            </>
          ) : null}

          {tab.id === "materias" ? <SituacionAlumno rows={situacion} /> : null}
          {tab.id === "documentos" ? <DocumentosAlumno alumnoId={alumno.id} /> : null}
          {tab.id === "historial" ? <HistorialAlumno rows={cambios} /> : null}
        </div>
      ))}
    </div>
  );
}
