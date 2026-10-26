import { mkdir } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";

const output = path.join(process.cwd(), "public", "plantillas", "planilla-viva-ejemplo.xlsx");

const BURGUNDY = "FF6B1A1F";
const LIGHT = "FFF4EFE8";

const sheets = [
  {
    name: "Instrucciones",
    columns: [{ header: "Planilla Viva · plantilla de ejemplo", width: 80 }],
    rows: [
      ["Esta planilla muestra las columnas que usará la importación cuando el sistema tenga backend."],
      [""],
      ["Cómo usarla"],
      ["1. Completá una hoja por tipo de dato, sin cambiar los encabezados."],
      ["2. No borres ni agregues columnas: el orden y los nombres son parte del formato."],
      ["3. Usá una fila por alumno, materia, clase o nota."],
      ["4. Las fechas van como AAAA-MM-DD (por ejemplo, 2026-05-15)."],
      ["5. Las notas van de 1 a 10. La asistencia usa P (presente), A (ausente), J (justificada) o T (tarde)."],
      [""],
      ["Importante"],
      ["Los datos de esta plantilla son ficticios y sirven solo como ejemplo."],
      ["La importación automática todavía no está implementada: esta planilla es la referencia de columnas."],
      ["No incluyas datos personales reales en el repositorio ni en la demo."],
    ],
  },
  {
    name: "Alumnos",
    columns: [
      { header: "Legajo", width: 12 },
      { header: "Apellido", width: 22 },
      { header: "Nombre", width: 20 },
      { header: "DNI", width: 14 },
      { header: "Año", width: 8 },
      { header: "Email", width: 30 },
      { header: "Teléfono", width: 18 },
      { header: "Activo", width: 10 },
    ],
    rows: [
      ["1001", "Apellido de ejemplo", "Nombre de ejemplo", "30000001", 1, "alumno1@ejemplo.edu.ar", "11 5555-0001", "Sí"],
      ["1002", "Apellido de ejemplo", "Nombre de ejemplo", "30000002", 1, "alumno2@ejemplo.edu.ar", "11 5555-0002", "Sí"],
      ["1003", "Apellido de ejemplo", "Nombre de ejemplo", "30000003", 2, "alumno3@ejemplo.edu.ar", "11 5555-0003", "Sí"],
    ],
    validations: [
      { column: 5, values: ["1", "2", "3", "4"] },
      { column: 8, values: ["Sí", "No"] },
    ],
  },
  {
    name: "Materias",
    columns: [
      { header: "Año", width: 8 },
      { header: "Materia", width: 42 },
      { header: "Régimen", width: 16 },
      { header: "Horas totales", width: 14 },
      { header: "Docente", width: 26 },
    ],
    rows: [
      [1, "Didáctica General", "Anual", 96, "Apellido, Nombre"],
      [1, "Pedagogía", "Anual", 64, "Apellido, Nombre"],
      [2, "Fisiología de la Motricidad", "Anual", 96, "Apellido, Nombre"],
      [4, "TFO: Tesis", "Cuatrimestral", 64, "Apellido, Nombre"],
    ],
    validations: [
      { column: 1, values: ["1", "2", "3", "4"] },
      { column: 3, values: ["Anual", "Cuatrimestral"] },
    ],
  },
  {
    name: "Inscripciones",
    columns: [
      { header: "Legajo", width: 12 },
      { header: "Año", width: 8 },
      { header: "Materia", width: 42 },
      { header: "Ciclo", width: 10 },
    ],
    rows: [
      ["1001", 1, "Didáctica General", 2026],
      ["1001", 1, "Pedagogía", 2026],
      ["1002", 1, "Didáctica General", 2026],
    ],
    validations: [{ column: 2, values: ["1", "2", "3", "4"] }],
  },
  {
    name: "Asistencias",
    columns: [
      { header: "Fecha", width: 14 },
      { header: "Materia", width: 42 },
      { header: "Legajo", width: 12 },
      { header: "Estado", width: 12 },
      { header: "Horas", width: 10 },
    ],
    rows: [
      ["2026-03-09", "Didáctica General", "1001", "P", 2],
      ["2026-03-09", "Didáctica General", "1002", "A", 2],
      ["2026-03-16", "Didáctica General", "1001", "T", 2],
    ],
    validations: [
      { column: 4, values: ["P", "A", "J", "T"] },
      { column: 5, values: ["1", "2", "3", "4"] },
    ],
  },
  {
    name: "Notas",
    columns: [
      { header: "Materia", width: 42 },
      { header: "Evaluación", width: 20 },
      { header: "Fecha", width: 14 },
      { header: "Legajo", width: 12 },
      { header: "Nota", width: 10 },
    ],
    rows: [
      ["Didáctica General", "Parcial 1", "2026-05-15", "1001", 8],
      ["Didáctica General", "Parcial 1", "2026-05-15", "1002", 4],
      ["Didáctica General", "TP 1", "2026-06-05", "1001", 7],
    ],
    validations: [{ column: 5, values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] }],
  },
  {
    name: "Parámetros",
    columns: [
      { header: "Clave", width: 34 },
      { header: "Valor", width: 18 },
      { header: "Descripción", width: 70 },
    ],
    rows: [
      ["porcentaje_minimo_asistencia", 75, "Porcentaje de asistencia requerido para no quedar libre."],
      ["nota_aprobacion", 4, "Promedio mínimo para aprobar."],
      ["nota_promocion", 7, "Promedio mínimo para promocionar la materia."],
      ["justificada_computa", "No", "Si una falta justificada suma horas de asistencia."],
      ["tardanza_fraccion", 0.5, "Fracción de la hora que suma una tardanza."],
      ["ciclo_inicio", "2026-03-02", "Primer día del ciclo lectivo."],
      ["ciclo_fin", "2026-12-18", "Último día del ciclo lectivo."],
      ["cuota_desde", "marzo", "Primer mes de cuotas (dato administrativo)."],
      ["cuota_hasta", "diciembre", "Último mes de cuotas (dato administrativo)."],
    ],
  },
  {
    name: "Calendario",
    columns: [
      { header: "Fecha", width: 14 },
      { header: "Hito", width: 34 },
      { header: "Detalle", width: 60 },
    ],
    rows: [
      ["2026-03-02", "Inicio del ciclo", "Primer día de clases."],
      ["2026-05-15", "Parcial 1", "Evaluación obligatoria."],
      ["2026-06-05", "TP 1", "Trabajo práctico obligatorio."],
      ["2026-06-26", "Recuperatorio", "Instancia no obligatoria."],
      ["2026-12-18", "Fin del ciclo", "Cierre del ciclo lectivo."],
    ],
  },
];

function styleSheet(sheet, columns, rows) {
  sheet.columns = columns;
  sheet.addRows(rows);
  sheet.getRow(1).height = 24;

  for (let index = 1; index <= columns.length; index += 1) {
    const cell = sheet.getRow(1).getCell(index);
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BURGUNDY } };
    cell.alignment = { vertical: "middle" };
  }

  for (let index = 2; index <= rows.length + 1; index += 1) {
    const row = sheet.getRow(index);

    if (index % 2 === 0) {
      for (let column = 1; column <= columns.length; column += 1) {
        row.getCell(column).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: LIGHT },
        };
      }
    }
  }

  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };
}

const workbook = new ExcelJS.Workbook();
workbook.creator = "Planilla Viva";
workbook.created = new Date("2026-03-02T00:00:00Z");
workbook.modified = new Date("2026-03-02T00:00:00Z");

for (const definition of sheets) {
  const sheet = workbook.addWorksheet(definition.name);
  styleSheet(sheet, definition.columns, definition.rows);

  for (const validation of definition.validations ?? []) {
    for (let row = 2; row <= 200; row += 1) {
      sheet.getCell(row, validation.column).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${validation.values.join(",")}"`],
      };
    }
  }
}

await mkdir(path.dirname(output), { recursive: true });
await workbook.xlsx.writeFile(output);
console.log(`Plantilla generada: ${output}`);
