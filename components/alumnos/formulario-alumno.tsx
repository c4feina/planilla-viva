"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { CamposFormulario } from "@/components/alumnos/campos-formulario";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  buildCursadasParaAlumno,
  diffAlumno,
  nextAlumnoId,
  nextLegajo,
} from "@/lib/alumnos";
import { useAcademicDispatch, useAcademicStore } from "@/lib/store/academic-store";
import type { Alumno, Clase, Comision } from "@/lib/types";
import {
  hasErrors,
  validateAlumno,
  type AlumnoFormErrors,
  type AlumnoFormValues,
} from "@/lib/validaciones";

export function FormularioAlumno({
  alumnoId,
  comisiones,
  clases,
}: {
  alumnoId?: string;
  comisiones: readonly Comision[];
  clases: readonly Clase[];
}) {
  const { alumnos } = useAcademicStore();
  const dispatch = useAcademicDispatch();
  const router = useRouter();
  const alumno = alumnoId === undefined ? undefined : alumnos.find((item) => item.id === alumnoId);
  const [values, setValues] = useState<AlumnoFormValues>(() => ({
    apellido: alumno?.apellido ?? "",
    nombre: alumno?.nombre ?? "",
    dni: alumno?.dni ?? "",
    legajo: alumno?.legajo ?? nextLegajo(alumnos),
    anioCursada: alumno?.anioCursada ?? 1,
    cuotaAlDia: alumno?.cuotaAlDia ?? true,
  }));
  const [errors, setErrors] = useState<AlumnoFormErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const esEdicion = alumnoId !== undefined;

  if (esEdicion && alumno === undefined) {
    return (
      <EmptyState
        titulo="Alumno no encontrado"
        descripcion="El alumno que querés editar no existe o fue dado de baja del listado."
        accion={
          <Button asChild variant="outline">
            <Link href="/alumnos">Volver a alumnos</Link>
          </Button>
        }
      />
    );
  }

  function update<K extends keyof AlumnoFormValues>(key: K, value: AlumnoFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const siguientesErrores = validateAlumno(values, alumnos, alumno?.id);
    setErrors(siguientesErrores);

    if (hasErrors(siguientesErrores)) {
      setStatus(null);
      const firstKey = Object.keys(siguientesErrores)[0];
      const firstId =
        firstKey === "anioCursada"
          ? "anio-cursada"
          : firstKey === "cuotaAlDia"
            ? "cuota-si"
            : firstKey;
      document.getElementById(firstId)?.focus();
      return;
    }

    const limpio = {
      apellido: values.apellido.trim(),
      nombre: values.nombre.trim(),
      dni: values.dni.trim(),
      legajo: values.legajo.trim(),
      anioCursada: values.anioCursada,
      cuotaAlDia: values.cuotaAlDia,
    };

    if (alumno === undefined) {
      const id = nextAlumnoId(alumnos);
      const nuevo: Alumno = { id, ...limpio, activo: true };
      const cursadas = buildCursadasParaAlumno(nuevo, comisiones, clases);

      dispatch({
        type: "addAlumno",
        alumno: nuevo,
        cursadas,
        fecha: new Date().toISOString(),
      });
      router.push(`/alumnos/${id}?creado=1`);
      return;
    }

    const siguiente: Alumno = { ...alumno, ...limpio };
    const cambios = diffAlumno(alumno, siguiente);

    if (cambios.length === 0) {
      setStatus("No hay cambios para guardar.");
      return;
    }

    dispatch({
      type: "updateAlumno",
      alumno: siguiente,
      cambios,
      fecha: new Date().toISOString(),
    });
    router.push(`/alumnos/${alumno.id}?actualizado=1`);
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={esEdicion ? "Editar alumno" : "Nuevo alumno"}
        description={
          esEdicion
            ? "Actualizá los datos del alumno. El año de cursada no se puede modificar."
            : "Completá los datos para inscribir al alumno en las materias de su año."
        }
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <CamposFormulario
          values={values}
          errors={errors}
          esEdicion={esEdicion}
          legajoSugerido={nextLegajo(alumnos)}
          onChange={update}
        />

        {hasErrors(errors) ? (
          <p role="alert" className="text-sm text-destructive">
            No se pudo guardar. Revisá los campos marcados.
          </p>
        ) : null}

        {status === null ? null : (
          <p role="status" className="text-sm text-muted-foreground">
            {status}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit">{esEdicion ? "Guardar cambios" : "Crear alumno"}</Button>
          <Button asChild variant="outline">
            <Link href={alumno === undefined ? "/alumnos" : `/alumnos/${alumno.id}`}>Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
