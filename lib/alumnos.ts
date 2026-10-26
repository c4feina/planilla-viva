import type { Alumno, AnioCursada, Clase, Comision, Cursada } from "@/lib/types";
import type { CambioCampo } from "@/lib/store/academic-store";

export function getAlumnoNombre(alumno: Alumno): string {
  return `${alumno.apellido}, ${alumno.nombre}`;
}

export function formatCuota(cuotaAlDia: boolean): string {
  return cuotaAlDia ? "Sí" : "No";
}

export function formatEstadoActivo(activo: boolean): string {
  return activo ? "Activo" : "De baja";
}

export function nextLegajo(alumnos: readonly Alumno[]): string {
  const maximo = alumnos.reduce((max, alumno) => {
    const valor = Number.parseInt(alumno.legajo, 10);
    return Number.isNaN(valor) ? max : Math.max(max, valor);
  }, 0);

  return String(maximo + 1);
}

export function nextAlumnoId(alumnos: readonly Alumno[]): string {
  const maximo = alumnos.reduce((max, alumno) => {
    const valor = Number.parseInt(alumno.id.replace("al-", ""), 10);
    return Number.isNaN(valor) ? max : Math.max(max, valor);
  }, 0);

  return `al-${String(maximo + 1).padStart(3, "0")}`;
}

export function buildCursadasParaAlumno(
  alumno: Alumno,
  comisiones: readonly Comision[],
  clases: readonly Clase[],
): Cursada[] {
  const delAnio = comisiones.filter((comision) => comision.anio === alumno.anioCursada);

  return delAnio.map((comision) => {
    const horasDictadas = clases
      .filter((clase) => clase.comision === comision.id && clase.tipo === "normal")
      .reduce((total, clase) => total + clase.horas, 0);

    return {
      id: `cur-${comision.id}-${alumno.id}`,
      alumno: alumno.id,
      comision: comision.id,
      condicion: "cursando",
      condicionManual: false,
      marcas: {},
      notas: {},
      resumen: {
        horasDictadas,
        horasAsistidas: 0,
        porcentaje: null,
      },
    };
  });
}

export function diffAlumno(actual: Alumno, siguiente: Alumno): CambioCampo[] {
  const cambios: CambioCampo[] = [];

  if (actual.apellido !== siguiente.apellido) {
    cambios.push({
      campo: "Apellido",
      valorAnterior: actual.apellido,
      valorNuevo: siguiente.apellido,
    });
  }

  if (actual.nombre !== siguiente.nombre) {
    cambios.push({
      campo: "Nombre",
      valorAnterior: actual.nombre,
      valorNuevo: siguiente.nombre,
    });
  }

  if (actual.dni !== siguiente.dni) {
    cambios.push({ campo: "DNI", valorAnterior: actual.dni, valorNuevo: siguiente.dni });
  }

  if (actual.legajo !== siguiente.legajo) {
    cambios.push({
      campo: "Legajo",
      valorAnterior: actual.legajo,
      valorNuevo: siguiente.legajo,
    });
  }

  if (actual.cuotaAlDia !== siguiente.cuotaAlDia) {
    cambios.push({
      campo: "Cuota al día",
      valorAnterior: formatCuota(actual.cuotaAlDia),
      valorNuevo: formatCuota(siguiente.cuotaAlDia),
    });
  }

  return cambios;
}

export function parseAnioCursada(value: string): AnioCursada | null {
  if (value === "1") return 1;
  if (value === "2") return 2;
  if (value === "3") return 3;
  if (value === "4") return 4;
  return null;
}
