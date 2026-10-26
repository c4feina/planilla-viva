"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";

import { FiltrosAlumnos } from "@/components/alumnos/filtros-alumnos";
import { ListaAlumnosMobile } from "@/components/alumnos/lista-alumnos-mobile";
import { PaginacionAlumnos } from "@/components/alumnos/paginacion-alumnos";
import { TablaAlumnos } from "@/components/alumnos/tabla-alumnos";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { formatNumero } from "@/lib/format";
import { filterAlumnos, type FiltroAnio, type FiltroCuota } from "@/lib/selectores";
import { useAcademicStore } from "@/lib/store/academic-store";

const PAGE_SIZE = 25;

export function ListadoAlumnos({
  initialQuery = "",
  initialCuota = "todas",
}: {
  initialQuery?: string;
  initialCuota?: FiltroCuota;
}) {
  const { alumnos } = useAcademicStore();
  const [query, setQuery] = useState(initialQuery);
  const [anio, setAnio] = useState<FiltroAnio>("todos");
  const [cuota, setCuota] = useState<FiltroCuota>(initialCuota);
  const [incluirBajas, setIncluirBajas] = useState(false);
  const [page, setPage] = useState(1);

  const rows = filterAlumnos(alumnos, { query, anio, cuota, incluirBajas });
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const desde = rows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(currentPage * PAGE_SIZE, rows.length);
  const visibles = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activos = alumnos.filter((alumno) => alumno.activo).length;
  const hasFilters = query.trim() !== "" || anio !== "todos" || cuota !== "todas" || incluirBajas;

  function clearFilters() {
    setQuery("");
    setAnio("todos");
    setCuota("todas");
    setIncluirBajas(false);
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Alumnos"
        description={`Ciclo lectivo 2026 · ${formatNumero(activos)} alumnos activos`}
        actions={
          <Button asChild>
            <Link href="/alumnos/nuevo">
              <Plus className="size-4" aria-hidden="true" />
              Nuevo alumno
            </Link>
          </Button>
        }
      />

      <FiltrosAlumnos
        query={query}
        anio={anio}
        cuota={cuota}
        incluirBajas={incluirBajas}
        hasFilters={hasFilters}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
        onAnioChange={(value) => {
          setAnio(value);
          setPage(1);
        }}
        onCuotaChange={(value) => {
          setCuota(value);
          setPage(1);
        }}
        onIncluirBajasChange={(value) => {
          setIncluirBajas(value);
          setPage(1);
        }}
        onClear={clearFilters}
      />

      <p className="mb-3 text-xs text-muted-foreground">
        {formatNumero(rows.length)} de {formatNumero(alumnos.length)} alumnos
      </p>

      {rows.length === 0 ? (
        <EmptyState
          titulo="No hay alumnos"
          descripcion="Probá con otro término de búsqueda o cambiá los filtros."
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
          <TablaAlumnos rows={visibles} />
          <ListaAlumnosMobile rows={visibles} />
          <PaginacionAlumnos
            page={currentPage}
            totalPages={totalPages}
            total={rows.length}
            desde={desde}
            hasta={hasta}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
