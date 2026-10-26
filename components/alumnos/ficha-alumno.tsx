"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, UserMinus, UserRoundCheck } from "lucide-react";

import { FichaTabs } from "@/components/alumnos/ficha-tabs";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { countConditions } from "@/lib/academic";
import { getAlumnoNombre } from "@/lib/alumnos";
import { formatAnio } from "@/lib/format";
import { buildSituacionAlumno } from "@/lib/selectores";
import { useAcademicDispatch, useAcademicStore } from "@/lib/store/academic-store";
import type { Comision, UnidadCurricular } from "@/lib/types";

export function FichaAlumno({
  alumnoId,
  comisiones,
  unidades,
  mensaje,
}: {
  alumnoId: string;
  comisiones: readonly Comision[];
  unidades: readonly UnidadCurricular[];
  mensaje?: string;
}) {
  const { alumnos, cursadas, documentos, historial } = useAcademicStore();
  const dispatch = useAcademicDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const alumno = alumnos.find((item) => item.id === alumnoId);

  if (alumno === undefined) {
    return (
      <EmptyState
        titulo="Alumno no encontrado"
        descripcion="No existe un alumno con ese identificador."
        accion={
          <Button asChild variant="outline">
            <Link href="/alumnos">Volver a alumnos</Link>
          </Button>
        }
      />
    );
  }

  const cursadasAlumno = cursadas.filter((cursada) => cursada.alumno === alumno.id);
  const condiciones = countConditions(cursadasAlumno);
  const situacion = buildSituacionAlumno(alumno.id, cursadas, comisiones, unidades);
  const cambios = historial
    .filter((cambio) => cambio.alumnoId === alumno.id)
    .slice()
    .reverse();
  const documentosCount = documentos.filter(
    (documento) => documento.alumnoId === alumno.id,
  ).length;
  const visibleMessage = status ?? mensaje;

  function handleBaja() {
    if (alumno === undefined) {
      return;
    }

    dispatch({
      type: "setAlumnoActivo",
      alumnoId: alumno.id,
      activo: false,
      fecha: new Date().toISOString(),
    });
    setStatus("Alumno dado de baja.");
  }

  function handleReactivar() {
    if (alumno === undefined) {
      return;
    }

    dispatch({
      type: "setAlumnoActivo",
      alumnoId: alumno.id,
      activo: true,
      fecha: new Date().toISOString(),
    });
    setStatus("Alumno reactivado.");
  }

  return (
    <div>
      <PageHeader
        title={getAlumnoNombre(alumno)}
        description={`Legajo ${alumno.legajo} · DNI ${alumno.dni} · ${formatAnio(alumno.anioCursada)} año · ${alumno.activo ? "Activo" : "De baja"}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/alumnos/${alumno.id}/editar`}>
                <Pencil className="size-4" aria-hidden="true" />
                Editar
              </Link>
            </Button>
            {alumno.activo ? (
              <Button type="button" variant="destructive" onClick={() => setDialogOpen(true)}>
                <UserMinus className="size-4" aria-hidden="true" />
                Dar de baja
              </Button>
            ) : (
              <Button type="button" onClick={handleReactivar}>
                <UserRoundCheck className="size-4" aria-hidden="true" />
                Reactivar
              </Button>
            )}
          </>
        }
      />

      {visibleMessage === undefined ? null : (
        <p
          role="status"
          className="mb-4 rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {visibleMessage}
        </p>
      )}

      <FichaTabs
        alumno={alumno}
        totalCursadas={cursadasAlumno.length}
        condiciones={condiciones}
        situacion={situacion}
        cambios={cambios}
        documentosCount={documentosCount}
      />

      <AlertDialog
        open={dialogOpen}
        title="Dar de baja al alumno"
        description={`${getAlumnoNombre(alumno)} deja de aparecer en listas, planillas y totales. La baja queda registrada en el historial y se puede revertir.`}
        confirmLabel="Dar de baja"
        onConfirm={handleBaja}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
