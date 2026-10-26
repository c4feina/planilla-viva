import type {
  Alumno,
  Comision,
  Condicion,
  Cursada,
  Docente,
  UnidadCurricular,
} from "@/lib/types";

export interface ComisionResumen {
  comision: Comision;
  unidad: UnidadCurricular;
  docentes: Docente[];
  inscriptos: number;
  libres: number;
}

export interface CursadaConAlumno {
  cursada: Cursada;
  alumno: Alumno;
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getDocentesDeComision(
  comision: Comision,
  docentes: readonly Docente[],
): Docente[] {
  const byId = new Map(docentes.map((docente) => [docente.id, docente]));

  return comision.docentes
    .map((docenteId) => byId.get(docenteId))
    .filter((docente): docente is Docente => docente !== undefined);
}

export function getDocentesLabel(docentes: readonly Docente[]): string {
  const names = docentes.map((docente) => `${docente.nombre} ${docente.apellido}`);

  if (names.length === 0) {
    return "Sin docentes asignados";
  }

  if (names.length === 1) {
    return names[0] ?? "";
  }

  const last = names[names.length - 1] ?? "";
  return `${names.slice(0, -1).join(", ")} y ${last}`;
}

export function getCursadasDeComision(
  cursadas: readonly Cursada[],
  alumnos: readonly Alumno[],
  comisionId: string,
): CursadaConAlumno[] {
  const alumnosById = new Map(alumnos.map((alumno) => [alumno.id, alumno]));

  return cursadas
    .filter((cursada) => cursada.comision === comisionId)
    .map((cursada) => {
      const alumno = alumnosById.get(cursada.alumno);

      if (alumno === undefined || !alumno.activo) {
        return undefined;
      }

      return { cursada, alumno };
    })
    .filter((row): row is CursadaConAlumno => row !== undefined)
    .sort((left, right) =>
      `${left.alumno.apellido} ${left.alumno.nombre}`.localeCompare(
        `${right.alumno.apellido} ${right.alumno.nombre}`,
        "es",
      ),
    );
}

export function countConditions(
  cursadas: readonly Cursada[],
): Record<Condicion, number> {
  const counts: Record<Condicion, number> = {
    cursando: 0,
    regular: 0,
    libre: 0,
    aprobada: 0,
    recursa: 0,
  };

  for (const cursada of cursadas) {
    counts[cursada.condicion] += 1;
  }

  return counts;
}

export function buildPresenceFromClass(
  rows: readonly CursadaConAlumno[],
  claseId: string | undefined,
): Record<string, boolean> {
  const presence: Record<string, boolean> = {};

  for (const row of rows) {
    const marca = claseId === undefined ? undefined : row.cursada.marcas[claseId];
    presence[row.cursada.id] = marca === "P" || marca === "T";
  }

  return presence;
}

export function buildComisionesResumen(
  comisiones: readonly Comision[],
  unidades: readonly UnidadCurricular[],
  docentes: readonly Docente[],
  cursadas: readonly Cursada[],
  alumnos: readonly Alumno[],
): ComisionResumen[] {
  const unidadesById = new Map(unidades.map((unidad) => [unidad.id, unidad]));
  const activeAlumnos = new Set(
    alumnos.filter((alumno) => alumno.activo).map((alumno) => alumno.id),
  );
  const counts = new Map<string, { inscriptos: number; libres: number }>();

  for (const cursada of cursadas) {
    if (!activeAlumnos.has(cursada.alumno)) {
      continue;
    }

    const current = counts.get(cursada.comision) ?? { inscriptos: 0, libres: 0 };
    current.inscriptos += 1;

    if (cursada.condicion === "libre") {
      current.libres += 1;
    }

    counts.set(cursada.comision, current);
  }

  return comisiones
    .map((comision) => {
      const unidad = unidadesById.get(comision.unidadCurricular);
      const count = counts.get(comision.id) ?? { inscriptos: 0, libres: 0 };

      if (unidad === undefined) {
        return undefined;
      }

      return {
        comision,
        unidad,
        docentes: getDocentesDeComision(comision, docentes),
        inscriptos: count.inscriptos,
        libres: count.libres,
      };
    })
    .filter((row): row is ComisionResumen => row !== undefined)
    .sort((left, right) => {
      if (left.comision.anio !== right.comision.anio) {
        return left.comision.anio - right.comision.anio;
      }

      return left.unidad.nombre.localeCompare(right.unidad.nombre, "es");
    });
}
