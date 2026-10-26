import type {
  Alumno,
  AnioCursada,
  Comision,
  Condicion,
  Cursada,
  Docente,
  Evaluacion,
  UnidadCurricular,
} from "@/lib/types";
import { countConditions, normalizeSearchText } from "@/lib/academic";
import { getAlumnoNombre } from "@/lib/alumnos";

export type FiltroCuota = "todas" | "aldia" | "noaldia";
export type FiltroAnio = "todos" | "1" | "2" | "3" | "4";

export interface FiltrosAlumnos {
  query: string;
  anio: FiltroAnio;
  cuota: FiltroCuota;
  incluirBajas: boolean;
}

export function filterAlumnos(
  alumnos: readonly Alumno[],
  filtros: FiltrosAlumnos,
): Alumno[] {
  const query = normalizeSearchText(filtros.query);

  return alumnos
    .filter((alumno) => {
      if (!filtros.incluirBajas && !alumno.activo) {
        return false;
      }

      if (filtros.anio !== "todos" && alumno.anioCursada !== Number(filtros.anio)) {
        return false;
      }

      if (filtros.cuota === "aldia" && !alumno.cuotaAlDia) {
        return false;
      }

      if (filtros.cuota === "noaldia" && alumno.cuotaAlDia) {
        return false;
      }

      if (query === "") {
        return true;
      }

      const haystack = normalizeSearchText(
        `${alumno.apellido} ${alumno.nombre} ${alumno.dni} ${alumno.legajo}`,
      );

      return haystack.includes(query);
    })
    .sort((left, right) =>
      getAlumnoNombre(left).localeCompare(getAlumnoNombre(right), "es"),
    );
}

export interface TableroComision {
  comision: Comision;
  unidad: UnidadCurricular;
  inscriptos: number;
  condiciones: Record<Condicion, number>;
}

export interface TableroAnio {
  anio: AnioCursada;
  alumnos: number;
  inscriptos: number;
  condiciones: Record<Condicion, number>;
  comisiones: TableroComision[];
}

function emptyCounts(): Record<Condicion, number> {
  return { cursando: 0, regular: 0, libre: 0, aprobada: 0, recursa: 0 };
}

function addCounts(
  target: Record<Condicion, number>,
  source: Record<Condicion, number>,
): void {
  for (const condicion of Object.keys(source) as Condicion[]) {
    target[condicion] += source[condicion];
  }
}

export function buildTablero(
  comisiones: readonly Comision[],
  unidades: readonly UnidadCurricular[],
  cursadas: readonly Cursada[],
  alumnos: readonly Alumno[],
): TableroAnio[] {
  const activos = new Set(alumnos.filter((alumno) => alumno.activo).map((alumno) => alumno.id));
  const unidadesById = new Map(unidades.map((unidad) => [unidad.id, unidad]));
  const cursadasPorComision = new Map<string, Cursada[]>();

  for (const cursada of cursadas) {
    if (!activos.has(cursada.alumno)) {
      continue;
    }

    const actuales = cursadasPorComision.get(cursada.comision) ?? [];
    actuales.push(cursada);
    cursadasPorComision.set(cursada.comision, actuales);
  }

  const anios: AnioCursada[] = [1, 2, 3, 4];

  return anios.map((anio) => {
    const condiciones = emptyCounts();
    const alumnosDelAnio = new Set<string>();
    let inscriptos = 0;
    const filas: TableroComision[] = [];

    for (const comision of comisiones) {
      if (comision.anio !== anio) {
        continue;
      }

      const unidad = unidadesById.get(comision.unidadCurricular);

      if (unidad === undefined) {
        continue;
      }

      const rows = cursadasPorComision.get(comision.id) ?? [];
      const counts = countConditions(rows);
      addCounts(condiciones, counts);
      inscriptos += rows.length;

      for (const row of rows) {
        alumnosDelAnio.add(row.alumno);
      }

      filas.push({
        comision,
        unidad,
        inscriptos: rows.length,
        condiciones: counts,
      });
    }

    filas.sort((left, right) => left.unidad.nombre.localeCompare(right.unidad.nombre, "es"));

    return { anio, alumnos: alumnosDelAnio.size, inscriptos, condiciones, comisiones: filas };
  });
}

export interface DocentePendiente {
  docente: Docente;
  comisiones: number;
  notasPendientes: number;
}

export function buildDocentesPendientes(
  comisiones: readonly Comision[],
  docentes: readonly Docente[],
  evaluaciones: readonly Evaluacion[],
  cursadas: readonly Cursada[],
  alumnos: readonly Alumno[],
): DocentePendiente[] {
  const activos = new Set(alumnos.filter((alumno) => alumno.activo).map((alumno) => alumno.id));
  const docentesById = new Map(docentes.map((docente) => [docente.id, docente]));
  const obligatoriasPorComision = new Map<string, Evaluacion[]>();

  for (const evaluacion of evaluaciones) {
    if (!evaluacion.obligatoria) {
      continue;
    }

    const actuales = obligatoriasPorComision.get(evaluacion.comision) ?? [];
    actuales.push(evaluacion);
    obligatoriasPorComision.set(evaluacion.comision, actuales);
  }

  const acumulado = new Map<string, { comisiones: Set<string>; notas: number }>();

  for (const comision of comisiones) {
    const rows = cursadas.filter(
      (cursada) => cursada.comision === comision.id && activos.has(cursada.alumno),
    );
    const obligatorias = obligatoriasPorComision.get(comision.id) ?? [];
    let pendientes = 0;

    for (const evaluacion of obligatorias) {
      pendientes += rows.filter((cursada) => cursada.notas[evaluacion.id] === undefined).length;
    }

    if (pendientes === 0) {
      continue;
    }

    for (const docenteId of comision.docentes) {
      const actual = acumulado.get(docenteId) ?? { comisiones: new Set<string>(), notas: 0 };
      actual.comisiones.add(comision.id);
      actual.notas += pendientes;
      acumulado.set(docenteId, actual);
    }
  }

  return [...acumulado.entries()]
    .map(([docenteId, valor]) => {
      const docente = docentesById.get(docenteId);

      if (docente === undefined) {
        return undefined;
      }

      return {
        docente,
        comisiones: valor.comisiones.size,
        notasPendientes: valor.notas,
      };
    })
    .filter((row): row is DocentePendiente => row !== undefined)
    .sort((left, right) => {
      if (left.comisiones !== right.comisiones) {
        return right.comisiones - left.comisiones;
      }

      return `${left.docente.apellido}, ${left.docente.nombre}`.localeCompare(
        `${right.docente.apellido}, ${right.docente.nombre}`,
        "es",
      );
    });
}

export interface AlertasTablero {
  alumnosConLibres: number;
  cursadasLibres: number;
  docentesPendientes: number;
  notasPendientes: number;
  cuotasImpagas: number;
}

export function buildAlertas(
  alumnos: readonly Alumno[],
  cursadas: readonly Cursada[],
  pendientes: readonly DocentePendiente[],
): AlertasTablero {
  const activos = new Set(alumnos.filter((alumno) => alumno.activo).map((alumno) => alumno.id));
  const alumnosConLibres = new Set<string>();
  let cursadasLibres = 0;

  for (const cursada of cursadas) {
    if (!activos.has(cursada.alumno) || cursada.condicion !== "libre") {
      continue;
    }

    alumnosConLibres.add(cursada.alumno);
    cursadasLibres += 1;
  }

  return {
    alumnosConLibres: alumnosConLibres.size,
    cursadasLibres,
    docentesPendientes: pendientes.length,
    notasPendientes: pendientes.reduce((total, row) => total + row.notasPendientes, 0),
    cuotasImpagas: alumnos.filter((alumno) => alumno.activo && !alumno.cuotaAlDia).length,
  };
}

export function buildAsistenciaPromedioInstitucional(
  comisiones: readonly Comision[],
  cursadas: readonly Cursada[],
  alumnos: readonly Alumno[],
): number | null {
  const activos = new Set(alumnos.filter((alumno) => alumno.activo).map((alumno) => alumno.id));
  const porcentajesPorComision = new Map<string, number[]>();

  for (const cursada of cursadas) {
    const porcentaje = cursada.resumen.porcentaje;

    if (!activos.has(cursada.alumno) || porcentaje === null) {
      continue;
    }

    const actuales = porcentajesPorComision.get(cursada.comision) ?? [];
    actuales.push(porcentaje);
    porcentajesPorComision.set(cursada.comision, actuales);
  }

  const promedios = comisiones
    .map((comision) => {
      const porcentajes = porcentajesPorComision.get(comision.id);

      if (porcentajes === undefined || porcentajes.length === 0) {
        return null;
      }

      return porcentajes.reduce((total, porcentaje) => total + porcentaje, 0) / porcentajes.length;
    })
    .filter((promedio): promedio is number => promedio !== null);

  if (promedios.length === 0) {
    return null;
  }

  return (
    Math.round(
      (promedios.reduce((total, promedio) => total + promedio, 0) / promedios.length) * 10,
    ) / 10
  );
}

export interface SituacionAlumno {
  comision: Comision;
  unidad: UnidadCurricular;
  cursada: Cursada;
}

export function buildSituacionAlumno(
  alumnoId: string,
  cursadas: readonly Cursada[],
  comisiones: readonly Comision[],
  unidades: readonly UnidadCurricular[],
): SituacionAlumno[] {
  const comisionesById = new Map(comisiones.map((comision) => [comision.id, comision]));
  const unidadesById = new Map(unidades.map((unidad) => [unidad.id, unidad]));

  return cursadas
    .filter((cursada) => cursada.alumno === alumnoId)
    .map((cursada) => {
      const comision = comisionesById.get(cursada.comision);
      const unidad = comision === undefined ? undefined : unidadesById.get(comision.unidadCurricular);

      if (comision === undefined || unidad === undefined) {
        return undefined;
      }

      return { comision, unidad, cursada };
    })
    .filter((row): row is SituacionAlumno => row !== undefined)
    .sort((left, right) => {
      if (left.comision.anio !== right.comision.anio) {
        return left.comision.anio - right.comision.anio;
      }

      return left.unidad.nombre.localeCompare(right.unidad.nombre, "es");
    });
}
