"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { AlertasTablero } from "@/components/tablero/alertas-tablero";
import { DocentesPendientes } from "@/components/tablero/docentes-pendientes";
import { EstadoComisiones } from "@/components/tablero/estado-comisiones";
import { MetricasTablero } from "@/components/tablero/metricas-tablero";
import { useAcademicStore } from "@/lib/store/academic-store";
import {
  buildAlertas,
  buildAsistenciaPromedioInstitucional,
  buildDocentesPendientes,
  buildTablero,
} from "@/lib/selectores";
import type { Comision, Docente, Evaluacion, UnidadCurricular } from "@/lib/types";

export function Tablero({
  comisiones,
  unidades,
  docentes,
  evaluaciones,
}: {
  comisiones: readonly Comision[];
  unidades: readonly UnidadCurricular[];
  docentes: readonly Docente[];
  evaluaciones: readonly Evaluacion[];
}) {
  const { alumnos, cursadas, ciclo } = useAcademicStore();

  const anios = useMemo(
    () => buildTablero(comisiones, unidades, cursadas, alumnos),
    [comisiones, unidades, cursadas, alumnos],
  );
  const pendientes = useMemo(
    () => buildDocentesPendientes(comisiones, docentes, evaluaciones, cursadas, alumnos),
    [comisiones, docentes, evaluaciones, cursadas, alumnos],
  );
  const alertas = useMemo(
    () => buildAlertas(alumnos, cursadas, pendientes),
    [alumnos, cursadas, pendientes],
  );
  const asistenciaPromedio = useMemo(
    () => buildAsistenciaPromedioInstitucional(comisiones, cursadas, alumnos),
    [comisiones, cursadas, alumnos],
  );
  const alumnosActivos = alumnos.filter((alumno) => alumno.activo).length;

  return (
    <div>
      <PageHeader
        title="Tablero"
        description={`Secretaría Académica · Ciclo lectivo ${ciclo.anio} · Estado académico del instituto`}
      />

      <MetricasTablero
        alumnosActivos={alumnosActivos}
        comisiones={comisiones.length}
        asistenciaPromedio={asistenciaPromedio}
      />

      <AlertasTablero alertas={alertas} />
      <EstadoComisiones anios={anios} />
      <DocentesPendientes rows={pendientes} />
    </div>
  );
}
