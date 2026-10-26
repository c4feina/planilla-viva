import type {
  Clase,
  Condicion,
  Evaluacion,
  MarcaAsistencia,
  ParametrosAcademicos,
  ResumenAsistencia,
} from "@/lib/types";

export interface DeriveCursadaInput {
  clases: readonly Clase[];
  marcas: Readonly<Record<string, MarcaAsistencia>>;
  evaluaciones: readonly Evaluacion[];
  notas: Readonly<Record<string, number>>;
  parametros: ParametrosAcademicos;
}

export interface CursadaDerivada {
  resumen: ResumenAsistencia;
  condicion: Condicion;
  condicionManual: boolean;
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function countAttendedHours(
  classes: readonly Clase[],
  marcas: Readonly<Record<string, MarcaAsistencia>>,
  parametros: ParametrosAcademicos,
): number {
  return classes.reduce((total, clase) => {
    const marca = marcas[clase.id];

    if (marca === "P") {
      return total + clase.horas;
    }

    if (marca === "T") {
      return total + clase.horas * parametros.tardanzaFraccion;
    }

    if (marca === "J" && parametros.justificadaComputa) {
      return total + clase.horas;
    }

    return total;
  }, 0);
}

export function summarizeAsistencia(
  clases: readonly Clase[],
  marcas: Readonly<Record<string, MarcaAsistencia>>,
  parametros: ParametrosAcademicos,
): ResumenAsistencia {
  const computableClasses = clases.filter((clase) => clase.tipo === "normal");
  const horasDictadas = computableClasses.reduce((total, clase) => total + clase.horas, 0);
  const tieneMarcas = computableClasses.some((clase) => marcas[clase.id] !== undefined);
  const horasAsistidas = countAttendedHours(computableClasses, marcas, parametros);

  if (horasDictadas === 0 || !tieneMarcas) {
    return {
      horasDictadas,
      horasAsistidas: 0,
      porcentaje: null,
    };
  }

  return {
    horasDictadas,
    horasAsistidas,
    porcentaje: roundOneDecimal((horasAsistidas / horasDictadas) * 100),
  };
}

export function deriveCursada({
  clases,
  marcas,
  evaluaciones,
  notas,
  parametros,
}: DeriveCursadaInput): CursadaDerivada {
  const resumen = summarizeAsistencia(clases, marcas, parametros);

  if (resumen.porcentaje === null) {
    return { resumen, condicion: "cursando", condicionManual: false };
  }

  if (resumen.porcentaje < parametros.porcentajeMinimoAsistencia) {
    return { resumen, condicion: "libre", condicionManual: false };
  }

  const evaluacionesObligatorias = evaluaciones.filter((evaluacion) => evaluacion.obligatoria);

  if (evaluacionesObligatorias.length === 0) {
    return { resumen, condicion: "cursando", condicionManual: false };
  }

  const faltaNota = evaluacionesObligatorias.some(
    (evaluacion) => notas[evaluacion.id] === undefined,
  );

  if (faltaNota) {
    return { resumen, condicion: "cursando", condicionManual: false };
  }

  const sumaNotas = evaluacionesObligatorias.reduce(
    (total, evaluacion) => total + (notas[evaluacion.id] ?? 0),
    0,
  );
  const promedio = sumaNotas / evaluacionesObligatorias.length;

  if (promedio < parametros.notaAprobacion) {
    return { resumen, condicion: "recursa", condicionManual: false };
  }

  if (promedio < parametros.notaPromocion) {
    return { resumen, condicion: "regular", condicionManual: false };
  }

  return { resumen, condicion: "aprobada", condicionManual: false };
}
