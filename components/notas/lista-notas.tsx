"use client";

import { EstadoBadge } from "@/components/estado-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CursadaConAlumno } from "@/lib/academic";
import { getAlumnoNombre } from "@/lib/alumnos";
import { validateNota } from "@/lib/validaciones";

export function ListaNotas({
  rows,
  evaluacionNombre,
  valores,
  onChange,
}: {
  rows: readonly CursadaConAlumno[];
  evaluacionNombre: string;
  valores: Readonly<Record<string, string>>;
  onChange: (cursadaId: string, value: string) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Alumno</TableHead>
            <TableHead className="hidden w-32 sm:table-cell">DNI</TableHead>
            <TableHead className="w-28">Nota</TableHead>
            <TableHead className="w-40">Condición actual</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ cursada, alumno }) => {
            const value = valores[cursada.id] ?? "";
            const error = validateNota(value);
            const inputId = `nota-${cursada.id}`;
            const errorId = `${inputId}-error`;

            return (
              <TableRow key={cursada.id} className="h-12">
                <TableCell>
                  <span className="text-sm font-medium">{getAlumnoNombre(alumno)}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">Legajo {alumno.legajo}</p>
                </TableCell>
                <TableCell className="hidden text-xs tabular-nums text-muted-foreground sm:table-cell">
                  {alumno.dni}
                </TableCell>
                <TableCell>
                  <Label htmlFor={inputId} className="sr-only">
                    Nota de {getAlumnoNombre(alumno)} en {evaluacionNombre}
                  </Label>
                  <Input
                    id={inputId}
                    type="number"
                    min={1}
                    max={10}
                    step={1}
                    inputMode="numeric"
                    value={value}
                    placeholder="—"
                    onChange={(event) => onChange(cursada.id, event.target.value)}
                    aria-invalid={error === null ? undefined : true}
                    aria-describedby={error === null ? undefined : errorId}
                    className="h-8 w-20 tabular-nums"
                  />
                  {error === null ? null : (
                    <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
                      {error}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <EstadoBadge condicion={cursada.condicion} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
