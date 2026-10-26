"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDocentesLabel } from "@/lib/academic";
import { formatAnio, formatFecha } from "@/lib/format";
import { useAcademicStore } from "@/lib/store/academic-store";
import type { Comision, Docente, UnidadCurricular } from "@/lib/types";

type YearFilter = "todos" | "1" | "2" | "3" | "4";

function monthKey(fecha: string): string {
  return fecha.slice(0, 7);
}

function monthLabel(fecha: string): string {
  const [year, month] = fecha.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year ?? 2026, (month ?? 1) - 1, 1)));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function CalendarioAcademico({
  comisiones,
  unidades,
  docentes,
}: {
  comisiones: readonly Comision[];
  unidades: readonly UnidadCurricular[];
  docentes: readonly Docente[];
}) {
  const { evaluaciones, ciclo } = useAcademicStore();
  const [year, setYear] = useState<YearFilter>("todos");
  const comisionesById = useMemo(
    () => new Map(comisiones.map((comision) => [comision.id, comision])),
    [comisiones],
  );
  const unidadesById = useMemo(
    () => new Map(unidades.map((unidad) => [unidad.id, unidad])),
    [unidades],
  );
  const docentesById = useMemo(
    () => new Map(docentes.map((docente) => [docente.id, docente])),
    [docentes],
  );

  const rows = useMemo(() => {
    return evaluaciones
      .map((evaluacion) => {
        const comision = comisionesById.get(evaluacion.comision);

        if (comision === undefined) {
          return undefined;
        }

        const unidad = unidadesById.get(comision.unidadCurricular);

        if (unidad === undefined) {
          return undefined;
        }

        const docentesDeMateria = comision.docentes
          .map((id) => docentesById.get(id))
          .filter((docente): docente is Docente => docente !== undefined);

        return {
          evaluacion,
          comision,
          unidad,
          docentes: docentesDeMateria,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== undefined)
      .filter((row) => year === "todos" || row.comision.anio === Number(year))
      .sort((left, right) => left.evaluacion.fecha.localeCompare(right.evaluacion.fecha));
  }, [evaluaciones, comisionesById, unidadesById, docentesById, year]);

  const groups = useMemo(() => {
    const grouped = new Map<string, typeof rows>();

    for (const row of rows) {
      const key = monthKey(row.evaluacion.fecha);
      const current = grouped.get(key);

      if (current === undefined) {
        grouped.set(key, [row]);
      } else {
        current.push(row);
      }
    }

    return [...grouped.entries()];
  }, [rows]);

  return (
    <div>
      <PageHeader
        title="Calendario"
        description={`Ciclo lectivo ${ciclo.anio} · ${formatFecha(ciclo.inicio)} al ${formatFecha(ciclo.fin)}`}
      />

      <div className="mb-5 flex flex-col gap-3 rounded-md border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Evaluaciones del ciclo</p>
            <p className="text-xs text-muted-foreground">
              Las fechas se cargan por materia. El calendario general se ajusta en Configuración.
            </p>
          </div>
        </div>
        <div className="w-full sm:w-40">
          <Select value={year} onValueChange={(value) => setYear(value as YearFilter)}>
            <SelectTrigger aria-label="Filtrar por año">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los años</SelectItem>
              <SelectItem value="1">1.º año</SelectItem>
              <SelectItem value="2">2.º año</SelectItem>
              <SelectItem value="3">3.º año</SelectItem>
              <SelectItem value="4">4.º año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          titulo="No hay evaluaciones"
          descripcion="Cuando se carguen evaluaciones van a aparecer en este calendario."
        />
      ) : (
        <div className="space-y-6">
          {groups.map(([key, group]) => (
            <section key={key} aria-labelledby={`mes-${key}`}>
              <h2 id={`mes-${key}`} className="mb-2 text-sm font-semibold">
                {monthLabel(`${key}-01`)}
              </h2>
              <div className="divide-y divide-border rounded-md border border-border bg-background">
                {group.map(({ evaluacion, comision, unidad, docentes: docentesMateria }) => (
                  <div
                    key={evaluacion.id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        <span className="tabular-nums">{formatFecha(evaluacion.fecha)}</span>
                        <span className="mx-2 text-muted-foreground">·</span>
                        {unidad.nombre}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatAnio(comision.anio)} año · {evaluacion.nombre} ·{" "}
                        {evaluacion.obligatoria ? "Obligatoria" : "No obligatoria"} ·{" "}
                        {getDocentesLabel(docentesMateria)}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
                      <Link href={`/comisiones/${comision.id}/notas`}>Ver notas</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
