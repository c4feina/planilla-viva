"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { FiltrosComisiones, type YearFilter } from "@/components/comisiones/filtros-comisiones";
import { ListaComisionesMobile } from "@/components/comisiones/lista-comisiones-mobile";
import { TablaComisiones } from "@/components/comisiones/tabla-comisiones";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { buildComisionesResumen, getDocentesLabel, normalizeSearchText } from "@/lib/academic";
import { formatAnio } from "@/lib/format";
import { useAcademicStore } from "@/lib/store/academic-store";
import type { Comision, Docente, UnidadCurricular } from "@/lib/types";

export function ListadoComisiones({
  comisiones,
  unidades,
  docentes,
}: {
  comisiones: readonly Comision[];
  unidades: readonly UnidadCurricular[];
  docentes: readonly Docente[];
}) {
  const { alumnos, cursadas } = useAcademicStore();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<YearFilter>("todos");
  const rows = useMemo(
    () => buildComisionesResumen(comisiones, unidades, docentes, cursadas, alumnos),
    [comisiones, unidades, docentes, cursadas, alumnos],
  );
  const normalizedQuery = normalizeSearchText(query);
  const filteredRows = rows.filter((row) => {
    if (year !== "todos" && row.comision.anio !== Number(year)) {
      return false;
    }

    if (normalizedQuery === "") {
      return true;
    }

    const haystack = normalizeSearchText(
      `${row.unidad.nombre} ${getDocentesLabel(row.docentes)}`,
    );

    return haystack.includes(normalizedQuery);
  });
  const totalAlumnos = alumnos.filter((alumno) => alumno.activo).length;
  const hasFilters = query.trim() !== "" || year !== "todos";

  function clearFilters() {
    setQuery("");
    setYear("todos");
  }

  return (
    <div>
      <PageHeader
        title="Materias"
        description={`Ciclo lectivo 2026 · ${comisiones.length} materias · ${totalAlumnos} alumnos activos`}
      />

      <FiltrosComisiones
        query={query}
        year={year}
        hasFilters={hasFilters}
        onQueryChange={setQuery}
        onYearChange={setYear}
        onClear={clearFilters}
      />

      <p className="mb-3 text-xs text-muted-foreground">
        {filteredRows.length} de {rows.length} materias
        {year !== "todos" ? ` · ${formatAnio(Number(year))} año` : ""}
      </p>

      {filteredRows.length === 0 ? (
        <EmptyState
          titulo="No hay materias"
          descripcion="Probá con otro término de búsqueda o cambiá el filtro de año."
          accion={
            hasFilters ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <ListaComisionesMobile rows={filteredRows} />
          <TablaComisiones rows={filteredRows} />
        </>
      )}
    </div>
  );
}
