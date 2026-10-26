"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ClipboardCheck, ClipboardList, Download, Pencil } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ListaPlanillaMobile } from "@/components/planilla/lista-planilla-mobile";
import { ResumenPlanilla } from "@/components/planilla/resumen-planilla";
import { TablaPlanilla } from "@/components/planilla/tabla-planilla";
import { Button } from "@/components/ui/button";
import { countConditions, getCursadasDeComision, getDocentesLabel } from "@/lib/academic";
import {
  getMarcaAsistenciaLabel,
  MARCA_ASISTENCIA_LABELS,
  MARCA_ASISTENCIA_OPTIONS,
} from "@/lib/asistencia";
import { CONDICION_LABELS } from "@/lib/condiciones";
import { downloadCsv, slugifyFileName, toCsv } from "@/lib/csv";
import { formatAnio, formatFecha, formatHorasPar, formatPorcentaje } from "@/lib/format";
import { deriveCursada } from "@/lib/mock/derive";
import { useAcademicDispatch, useAcademicStore } from "@/lib/store/academic-store";
import type { Comision, Docente, MarcaAsistencia, UnidadCurricular } from "@/lib/types";

export function PlanillaComision({
  comision,
  unidad,
  docentes,
}: {
  comision: Comision;
  unidad: UnidadCurricular;
  docentes: readonly Docente[];
}) {
  const { alumnos, cursadas, clases: todasLasClases, evaluaciones, parametros } =
    useAcademicStore();
  const dispatch = useAcademicDispatch();
  const clases = todasLasClases
    .filter((clase) => clase.comision === comision.id)
    .sort((left, right) => left.fecha.localeCompare(right.fecha));
  const evaluacionesDeComision = evaluaciones.filter(
    (evaluacion) => evaluacion.comision === comision.id,
  );
  const [editable, setEditable] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const rows = getCursadasDeComision(cursadas, alumnos, comision.id);
  const conditions = countConditions(rows.map((row) => row.cursada));
  const porcentajes = rows
    .map(({ cursada }) => cursada.resumen.porcentaje)
    .filter((value): value is number => value !== null);
  const asistenciaPromedio =
    porcentajes.length === 0
      ? null
      : Math.round(
          (porcentajes.reduce((total, value) => total + value, 0) / porcentajes.length) * 10,
        ) / 10;

  function handleExport() {
    const headers = [
      "Alumno",
      "DNI",
      ...clases.map((clase) => formatFecha(clase.fecha)),
      "Horas",
      "Porcentaje",
      "Condición",
    ];
    const csvRows = rows.map(({ cursada, alumno }) => [
      `${alumno.apellido}, ${alumno.nombre}`,
      alumno.dni,
      ...clases.map((clase) => {
        if (clase.tipo !== "normal") {
          return "-";
        }

        return cursada.marcas[clase.id] ?? "";
      }),
      formatHorasPar(cursada.resumen.horasAsistidas, cursada.resumen.horasDictadas),
      formatPorcentaje(cursada.resumen.porcentaje),
      CONDICION_LABELS[cursada.condicion],
    ]);
    const fileName = `planilla-${slugifyFileName(unidad.nombre)}-${comision.cicloLectivo}.csv`;

    downloadCsv(fileName, toCsv(headers, csvRows));
  }

  function handleMarcaChange(
    cursadaId: string,
    claseId: string,
    marca: MarcaAsistencia | undefined,
  ) {
    const row = rows.find(({ cursada }) => cursada.id === cursadaId);
    const clase = clases.find((item) => item.id === claseId);

    if (row === undefined || clase === undefined || clase.tipo !== "normal") {
      return;
    }

    const anterior = row.cursada.marcas[claseId];

    if (anterior === marca) {
      return;
    }

    const marcas = { ...row.cursada.marcas };

    if (marca === undefined) {
      delete marcas[claseId];
    } else {
      marcas[claseId] = marca;
    }

    const derived = deriveCursada({
      clases,
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
      fecha: new Date().toISOString(),
      campo: `Asistencia · ${formatFecha(clase.fecha)}`,
      valorAnterior: getMarcaAsistenciaLabel(anterior),
      valorNuevo: getMarcaAsistenciaLabel(marca),
    });
    setStatus(`Asistencia corregida: ${row.alumno.apellido}, ${row.alumno.nombre}.`);
  }

  return (
    <div>
      <PageHeader
        title={unidad.nombre}
        description={`${formatAnio(comision.anio)} año · Ciclo lectivo ${comision.cicloLectivo} · ${rows.length} inscriptos · ${getDocentesLabel(docentes)}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/comisiones/${comision.id}/notas`}>
                <ClipboardList className="size-4" />
                Cargar notas
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={handleExport} disabled={rows.length === 0}>
              <Download className="size-4" />
              Exportar CSV
            </Button>
            <Button asChild>
              <Link href={`/comisiones/${comision.id}/asistencia`}>
                <ClipboardCheck className="size-4" />
                Tomar asistencia
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="hidden md:inline-flex"
              aria-pressed={editable}
              onClick={() => {
                setEditable((current) => !current);
                setStatus(null);
              }}
            >
              {editable ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Pencil className="size-4" aria-hidden="true" />
              )}
              {editable ? "Terminar corrección" : "Corregir asistencia"}
            </Button>
          </>
        }
      />

      {editable ? (
        <section
          aria-label="Corrección de asistencia"
          className="mb-4 rounded-md border border-border border-l-4 border-l-primary bg-background px-4 py-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Corrección de asistencia</p>
              <p className="mt-0.5 text-xs text-pretty text-muted-foreground">
                Elegí la marca de cada clase. Cada cambio queda registrado en el historial del
                alumno con la fecha y la hora.
              </p>
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {MARCA_ASISTENCIA_OPTIONS.map((marca) => (
                  <span key={marca}>
                    <span className="font-semibold text-foreground">{marca}</span>{" "}
                    {MARCA_ASISTENCIA_LABELS[marca]}
                  </span>
                ))}
                <span>
                  <span className="font-semibold text-foreground">–</span> Sin marca
                </span>
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditable(false);
                setStatus(null);
              }}
            >
              <Check className="size-4" aria-hidden="true" />
              Listo
            </Button>
          </div>
        </section>
      ) : null}

      {status === null ? null : (
        <p
          role="status"
          className="mb-4 rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {status}
        </p>
      )}

      <ResumenPlanilla
        asistenciaPromedio={asistenciaPromedio}
        inscriptos={rows.length}
        libres={conditions.libre}
        cursando={conditions.cursando}
      />

      {rows.length === 0 ? (
        <EmptyState
          titulo="La materia no tiene alumnos inscriptos"
          descripcion="Cuando se inscriban alumnos van a aparecer en esta planilla."
          accion={
            <Button asChild variant="outline">
              <Link href="/comisiones">Volver a materias</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ListaPlanillaMobile rows={rows} />
          <TablaPlanilla
            titulo={unidad.nombre}
            rows={rows}
            clases={clases}
            editable={editable}
            onMarcaChange={handleMarcaChange}
          />
        </>
      )}
    </div>
  );
}
