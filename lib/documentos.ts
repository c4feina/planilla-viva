import type { CategoriaDocumento, DocumentoAlumno } from "@/lib/types";

export const MAX_DOCUMENTO_BYTES = 10 * 1024 * 1024;

export const CATEGORIAS_DOCUMENTO: readonly {
  value: CategoriaDocumento;
  label: string;
}[] = [
  { value: "dni", label: "DNI" },
  { value: "constancia", label: "Constancia" },
  { value: "cuota", label: "Cuota" },
  { value: "analitico", label: "Analítico" },
  { value: "otro", label: "Otro" },
];

export const CATEGORIA_DOCUMENTO_LABELS: Record<CategoriaDocumento, string> = {
  dni: "DNI",
  constancia: "Constancia",
  cuota: "Cuota",
  analitico: "Analítico",
  otro: "Otro",
};

export function isCategoriaDocumento(value: string): value is CategoriaDocumento {
  return CATEGORIAS_DOCUMENTO.some((categoria) => categoria.value === value);
}

export function nextDocumentoId(documentos: readonly DocumentoAlumno[]): string {
  const max = documentos.reduce((mayor, documento) => {
    const numero = Number(documento.id.replace("doc-", ""));

    return Number.isFinite(numero) ? Math.max(mayor, numero) : mayor;
  }, 0);

  return `doc-${String(max + 1).padStart(3, "0")}`;
}

export function validateDocumento(file: File | null): string | null {
  if (file === null) {
    return "Seleccioná un archivo PDF.";
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return "El archivo debe ser un PDF.";
  }

  if (file.size === 0) {
    return "El archivo está vacío.";
  }

  if (file.size > MAX_DOCUMENTO_BYTES) {
    return "El PDF no puede superar los 10 MB.";
  }

  return null;
}
