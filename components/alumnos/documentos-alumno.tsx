"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Download, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIAS_DOCUMENTO,
  CATEGORIA_DOCUMENTO_LABELS,
  isCategoriaDocumento,
  nextDocumentoId,
  validateDocumento,
} from "@/lib/documentos";
import { formatFechaHora, formatTamanio } from "@/lib/format";
import { useAcademicDispatch, useAcademicStore } from "@/lib/store/academic-store";
import type { CategoriaDocumento, DocumentoAlumno } from "@/lib/types";

export function DocumentosAlumno({ alumnoId }: { alumnoId: string }) {
  const { documentos } = useAcademicStore();
  const dispatch = useAcademicDispatch();
  const [categoria, setCategoria] = useState<CategoriaDocumento>("otro");
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const docs = documentos.filter((documento) => documento.alumnoId === alumnoId).reverse();
  const describedBy =
    error === null ? "documento-archivo-hint" : "documento-archivo-hint documento-archivo-error";

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    setFile(selected);
    setStatus(null);

    if (selected === null) {
      setError(null);
      return;
    }

    setError(validateDocumento(selected));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateDocumento(file);

    if (validation !== null || file === null) {
      setError(validation ?? "Seleccioná un archivo PDF.");
      return;
    }

    const documento: DocumentoAlumno = {
      id: nextDocumentoId(documentos),
      alumnoId,
      categoria,
      nombre: file.name,
      tipo: file.type,
      tamanio: file.size,
      fecha: new Date().toISOString(),
      archivo: file,
    };

    dispatch({ type: "addDocumento", documento });
    setFile(null);
    setCategoria("otro");
    setInputKey((current) => current + 1);
    setError(null);
    setStatus("Documento guardado.");
  }

  function handleDownload(documento: DocumentoAlumno) {
    const url = URL.createObjectURL(documento.archivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = documento.nombre;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-labelledby="documentos-alumno" className="mb-6">
      <h2 id="documentos-alumno" className="mb-1 text-base font-semibold">
        Documentos
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        PDFs del alumno: DNI, constancias, comprobantes de cuota y otros. En esta demo los archivos
        se mantienen hasta recargar la página.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-md border border-border bg-background p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5 sm:w-44">
            <Label htmlFor="documento-categoria">Tipo de documento</Label>
            <Select
              value={categoria}
              onValueChange={(value) => {
                if (isCategoriaDocumento(value)) {
                  setCategoria(value);
                }
              }}
            >
              <SelectTrigger id="documento-categoria" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_DOCUMENTO.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-1.5">
            <Label htmlFor="documento-archivo">Archivo PDF</Label>
            <Input
              key={inputKey}
              id="documento-archivo"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              aria-invalid={error === null ? undefined : true}
              aria-describedby={describedBy}
            />
            <p id="documento-archivo-hint" className="text-xs text-muted-foreground">
              Formato PDF, hasta 10 MB.
            </p>
            {error === null ? null : (
              <p id="documento-archivo-error" role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <Button type="submit">
            <Upload className="size-4" aria-hidden="true" />
            Subir PDF
          </Button>
        </div>

        {status === null ? null : (
          <p role="status" className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {status}
          </p>
        )}
      </form>

      {docs.length === 0 ? (
        <p className="mt-3 rounded-md border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
          No hay documentos cargados.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-md border border-border bg-background">
          {docs.map((documento) => (
            <li
              key={documento.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{documento.nombre}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {CATEGORIA_DOCUMENTO_LABELS[documento.categoria]} ·{" "}
                    {formatTamanio(documento.tamanio)} · {formatFechaHora(documento.fecha)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDownload(documento)}
                className="self-start sm:self-auto"
              >
                <Download className="size-4" aria-hidden="true" />
                Descargar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
