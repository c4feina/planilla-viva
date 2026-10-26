import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileSpreadsheet, Info } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Excel de ejemplo",
};

const HOJAS = [
  {
    nombre: "Alumnos",
    uso: "Una fila por alumno.",
    columnas: ["Legajo", "Apellido", "Nombre", "DNI", "Año", "Email", "Teléfono", "Activo"],
  },
  {
    nombre: "Materias",
    uso: "Una fila por materia y año.",
    columnas: ["Año", "Materia", "Régimen", "Horas totales", "Docente"],
  },
  {
    nombre: "Inscripciones",
    uso: "Qué alumno cursa qué materia.",
    columnas: ["Legajo", "Año", "Materia", "Ciclo"],
  },
  {
    nombre: "Asistencias",
    uso: "Una fila por alumno y clase.",
    columnas: ["Fecha", "Materia", "Legajo", "Estado", "Horas"],
  },
  {
    nombre: "Notas",
    uso: "Una fila por alumno y evaluación.",
    columnas: ["Materia", "Evaluación", "Fecha", "Legajo", "Nota"],
  },
  {
    nombre: "Parámetros",
    uso: "Reglas académicas y fechas del ciclo.",
    columnas: ["Clave", "Valor", "Descripción"],
  },
  {
    nombre: "Calendario",
    uso: "Hitos y fechas generales.",
    columnas: ["Fecha", "Hito", "Detalle"],
  },
] as const;

const REGLAS = [
  "No cambiar los nombres ni el orden de los encabezados.",
  "Las fechas van como AAAA-MM-DD. Por ejemplo: 2026-05-15.",
  "Las notas van de 1 a 10.",
  "La asistencia usa P (presente), A (ausente), J (justificada) o T (tarde).",
  "Una fila por alumno, materia, clase o nota. No combines varios datos en una celda.",
  "Los datos de la plantilla son ficticios y sirven solo como ejemplo.",
] as const;

export default function ExcelPage() {
  return (
    <div>
      <PageHeader
        title="Excel de ejemplo"
        description="Formato de columnas para ordenar los datos antes de la importación."
        actions={
          <Button asChild>
            <a href="/plantillas/planilla-viva-ejemplo.xlsx" download>
              <Download className="size-4" aria-hidden="true" />
              Descargar plantilla
            </a>
          </Button>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-md border border-border bg-background px-4 py-3">
        <FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium">Planilla Viva · plantilla de ejemplo</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Incluye una hoja de instrucciones y una hoja por tipo de dato. Está pensada para que
            secretaría pueda completarla en Excel y después importarla cuando el sistema tenga
            backend.
          </p>
        </div>
      </div>

      <section aria-labelledby="hojas" className="mb-8">
        <h2 id="hojas" className="mb-3 text-base font-semibold">
          Hojas incluidas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {HOJAS.map((hoja) => (
            <article key={hoja.nombre} className="rounded-md border border-border bg-background p-4">
              <h3 className="text-sm font-semibold">{hoja.nombre}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{hoja.uso}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {hoja.columnas.join(" · ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="reglas" className="mb-8">
        <h2 id="reglas" className="mb-3 text-base font-semibold">
          Reglas del formato
        </h2>
        <ul className="space-y-2 text-sm">
          {REGLAS.map((regla) => (
            <li key={regla} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>{regla}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="importacion" className="rounded-md border border-border bg-background p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <h2 id="importacion" className="text-sm font-semibold">
              Sobre la importación
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              La importación automática queda para la etapa con backend. Por ahora esta plantilla
              sirve como referencia de columnas y para probar el circuito con datos ficticios.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Las reglas académicas y las fechas del ciclo se configuran en{" "}
              <Link href="/configuracion" className="font-medium text-foreground underline underline-offset-4">
                Configuración
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
