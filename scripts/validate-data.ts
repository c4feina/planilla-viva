import {
  alumnos,
  clases,
  comisiones,
  cursadas,
  docentes,
  evaluaciones,
  unidadesCurriculares,
} from "@/lib/mock/data";
import type { Condicion } from "@/lib/types";

const failures: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

check(comisiones.length === 47, `Comisiones: ${comisiones.length}`);
check(unidadesCurriculares.length === 47, `Unidades: ${unidadesCurriculares.length}`);
check(alumnos.length === 89, `Alumnos: ${alumnos.length}`);
check(docentes.length === 22, `Docentes: ${docentes.length}`);
check(cursadas.length === 1086, `Cursadas: ${cursadas.length}`);
check(clases.length === 47 * 14, `Clases: ${clases.length}`);
check(evaluaciones.length === 47 * 3, `Evaluaciones: ${evaluaciones.length}`);
check(
  alumnos.filter((alumno) => !alumno.cuotaAlDia).length === 8,
  "Cuota al día falsa distinta de 8",
);

const dniSet = new Set(alumnos.map((alumno) => alumno.dni));
check(dniSet.size === alumnos.length, "DNI duplicados");
for (const alumno of alumnos) {
  check(/^\d{8}$/.test(alumno.dni), `DNI inválido: ${alumno.dni}`);
}

const legajoSet = new Set(alumnos.map((alumno) => alumno.legajo));
check(legajoSet.size === alumnos.length, "Legajos duplicados");

const usedCombos = new Set<string>();
const totalConditions: Record<Condicion, number> = {
  libre: 0,
  regular: 0,
  aprobada: 0,
  cursando: 0,
  recursa: 0,
};
let nullPercentages = 0;

for (const comision of comisiones) {
  const commissionClasses = clases.filter((clase) => clase.comision === comision.id);
  const commissionCursadas = cursadas.filter((cursada) => cursada.comision === comision.id);
  const normalClasses = commissionClasses.filter((clase) => clase.tipo === "normal");
  const feriados = commissionClasses.filter((clase) => clase.tipo === "feriado");
  const canceladas = commissionClasses.filter((clase) => clase.tipo === "cancelada");
  const weekdays = new Set(commissionClasses.map((clase) => new Date(`${clase.fecha}T12:00:00`).getDay()));

  check(commissionClasses.length === 14, `${comision.id}: clases ${commissionClasses.length}`);
  check(feriados.length === 2, `${comision.id}: feriados ${feriados.length}`);
  check(canceladas.length === 1, `${comision.id}: canceladas ${canceladas.length}`);
  check(normalClasses.length === 11, `${comision.id}: normales ${normalClasses.length}`);
  check(weekdays.size === 1, `${comision.id}: días de semana ${weekdays.size}`);
  check(comision.docentes.length >= 1 && comision.docentes.length <= 2, `${comision.id}: docentes ${comision.docentes.length}`);

  const counts: Record<Condicion, number> = {
    libre: 0,
    regular: 0,
    aprobada: 0,
    cursando: 0,
    recursa: 0,
  };

  for (const cursada of commissionCursadas) {
    counts[cursada.condicion] += 1;
    totalConditions[cursada.condicion] += 1;

    if (cursada.resumen.porcentaje === null) {
      nullPercentages += 1;
    }

    for (const clase of commissionClasses) {
      if (clase.tipo !== "normal" && cursada.marcas[clase.id] !== undefined) {
        failures.push(`${cursada.id}: marca en clase no computable ${clase.id}`);
      }
    }
  }

  const total = commissionCursadas.length;
  check(counts.libre >= 2 && counts.libre <= 6, `${comision.id}: libres ${counts.libre}/${total}`);
  check(counts.recursa >= 0 && counts.recursa <= 2, `${comision.id}: recursa ${counts.recursa}`);
  check(
    counts.regular / total >= 0.4 && counts.regular / total <= 0.6,
    `${comision.id}: regular ${counts.regular}/${total}`,
  );
  check(
    counts.aprobada / total >= 0.1 && counts.aprobada / total <= 0.25,
    `${comision.id}: aprobada ${counts.aprobada}/${total}`,
  );
  check(
    counts.cursando / total >= 0.05 && counts.cursando / total <= 0.12,
    `${comision.id}: cursando ${counts.cursando}/${total}`,
  );

  const comboKey = [
    counts.libre,
    counts.regular,
    counts.aprobada,
    counts.cursando,
    counts.recursa,
  ].join("-");

  if (usedCombos.has(comboKey)) {
    failures.push(`Combinación repetida: ${comboKey}`);
  }
  usedCombos.add(comboKey);

  const percentages = commissionCursadas
    .map((cursada) => cursada.resumen.porcentaje)
    .filter((value): value is number => value !== null);
  const average =
    Math.round((percentages.reduce((sum, value) => sum + value, 0) / percentages.length) * 10) / 10;

  check(comision.asistenciaPromedio === average, `${comision.id}: promedio ${comision.asistenciaPromedio} != ${average}`);

  for (const clase of normalClasses) {
    const tardanzas = commissionCursadas.filter((cursada) => cursada.marcas[clase.id] === "T").length;
    const justificadas = commissionCursadas.filter((cursada) => cursada.marcas[clase.id] === "J").length;
    check(tardanzas <= 1, `${comision.id}/${clase.id}: ${tardanzas} tardanzas`);
    check(justificadas <= 1, `${comision.id}/${clase.id}: ${justificadas} justificadas`);
  }
}

check(nullPercentages === 1, `Porcentajes nulos: ${nullPercentages}`);

const fixed = [
  { unidad: "Didácticas de las Prácticas Gimnásticas I", docente: "Laura Giménez" },
  { unidad: "Fisiología de la Motricidad", docente: "Martín Rossi" },
  { unidad: "Fisiología de la Motricidad", docente: "Ana Duarte" },
  { unidad: "Análisis de las Acciones Motrices", docente: "Sofía Peralta" },
];

for (const item of fixed) {
  const unidad = unidadesCurriculares.find((candidate) => candidate.nombre === item.unidad);
  const comision = comisiones.find((candidate) => candidate.unidadCurricular === unidad?.id);
  const names = comision?.docentes.map((id) => {
    const docente = docentes.find((candidate) => candidate.id === id);
    return `${docente?.nombre} ${docente?.apellido}`;
  });

  check(names?.includes(item.docente) === true, `Docente fijo ausente: ${item.docente}`);
}

const docenteCounts = new Map<string, number>();
for (const comision of comisiones) {
  for (const docenteId of comision.docentes) {
    docenteCounts.set(docenteId, (docenteCounts.get(docenteId) ?? 0) + 1);
  }
}

for (const [docenteId, count] of docenteCounts) {
  check(count >= 2 && count <= 3, `${docenteId}: ${count} comisiones`);
}

const recursantes = new Map<string, number>();
for (const cursada of cursadas) {
  recursantes.set(cursada.alumno, (recursantes.get(cursada.alumno) ?? 0) + 1);
}

for (const alumno of alumnos) {
  const expected = alumno.anioCursada === 1 ? 14 : alumno.anioCursada === 2 ? 12 : alumno.anioCursada === 3 ? 10 : 11;
  const actual = recursantes.get(alumno.id) ?? 0;
  check(actual === expected || actual === expected + 1, `${alumno.id}: ${actual} cursadas, esperaba ${expected} o ${expected + 1}`);
}

check(
  alumnos.filter((alumno) => (recursantes.get(alumno.id) ?? 0) > (alumno.anioCursada === 1 ? 14 : alumno.anioCursada === 2 ? 12 : alumno.anioCursada === 3 ? 10 : 11)).length === 5,
  "Recursantes distintos de 5",
);

console.log({
  alumnos: alumnos.length,
  comisiones: comisiones.length,
  cursadas: cursadas.length,
  clases: clases.length,
  evaluaciones: evaluaciones.length,
  nullPercentages,
  totalConditions,
  combos: usedCombos.size,
  failures: failures.length,
});

if (failures.length > 0) {
  console.error(failures.slice(0, 50));
  process.exitCode = 1;
}
