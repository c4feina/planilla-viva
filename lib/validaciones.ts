import type { Alumno, AnioCursada } from "@/lib/types";

export interface AlumnoFormValues {
  apellido: string;
  nombre: string;
  dni: string;
  legajo: string;
  anioCursada: AnioCursada;
  cuotaAlDia: boolean;
}

export type AlumnoFormErrors = Partial<Record<keyof AlumnoFormValues, string>>;

export function validateAlumno(
  values: AlumnoFormValues,
  alumnos: readonly Alumno[],
  alumnoId?: string,
): AlumnoFormErrors {
  const errors: AlumnoFormErrors = {};
  const apellido = values.apellido.trim();
  const nombre = values.nombre.trim();
  const dni = values.dni.trim();
  const legajo = values.legajo.trim();
  const otros = alumnos.filter((alumno) => alumno.id !== alumnoId);

  if (apellido === "") {
    errors.apellido = "Ingresá el apellido.";
  }

  if (nombre === "") {
    errors.nombre = "Ingresá el nombre.";
  }

  if (dni === "") {
    errors.dni = "Ingresá el DNI.";
  } else if (!/^\d{8}$/.test(dni)) {
    errors.dni = "El DNI debe tener 8 dígitos numéricos.";
  } else if (otros.some((alumno) => alumno.dni === dni)) {
    errors.dni = "Ya existe un alumno con ese DNI.";
  }

  if (legajo === "") {
    errors.legajo = "Ingresá el legajo.";
  } else if (!/^\d+$/.test(legajo)) {
    errors.legajo = "El legajo debe ser numérico.";
  } else if (otros.some((alumno) => Number.parseInt(alumno.legajo, 10) === Number.parseInt(legajo, 10))) {
    errors.legajo = "Ya existe un alumno con ese legajo.";
  }

  if (values.anioCursada < 1 || values.anioCursada > 4) {
    errors.anioCursada = "Elegí un año de cursada entre 1.º y 4.º.";
  }

  return errors;
}

export function hasErrors(errors: AlumnoFormErrors): boolean {
  return Object.values(errors).some((value) => value !== undefined);
}

export function validateNota(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  if (!/^\d+$/.test(trimmed)) {
    return "La nota debe ser un número entre 1 y 10.";
  }

  const numero = Number.parseInt(trimmed, 10);

  if (numero < 1 || numero > 10) {
    return "La nota debe estar entre 1 y 10.";
  }

  return null;
}
