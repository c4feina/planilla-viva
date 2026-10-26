"use client";

import { Search } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import type { FiltroAnio, FiltroCuota } from "@/lib/selectores";

const ANIO_OPTIONS = [
  { value: "todos", label: "Todos los años" },
  { value: "1", label: "1.º año" },
  { value: "2", label: "2.º año" },
  { value: "3", label: "3.º año" },
  { value: "4", label: "4.º año" },
] as const;

const CUOTA_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "aldia", label: "Al día" },
  { value: "noaldia", label: "No al día" },
] as const;

export function FiltrosAlumnos({
  query,
  anio,
  cuota,
  incluirBajas,
  hasFilters,
  onQueryChange,
  onAnioChange,
  onCuotaChange,
  onIncluirBajasChange,
  onClear,
}: {
  query: string;
  anio: FiltroAnio;
  cuota: FiltroCuota;
  incluirBajas: boolean;
  hasFilters: boolean;
  onQueryChange: (value: string) => void;
  onAnioChange: (value: FiltroAnio) => void;
  onCuotaChange: (value: FiltroCuota) => void;
  onIncluirBajasChange: (value: boolean) => void;
  onClear: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="buscar-alumno" className="sr-only">
            Buscar por nombre, apellido o DNI
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="buscar-alumno"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar por nombre, apellido o DNI"
              className="pl-9"
              type="search"
            />
          </div>
        </div>

        <div className="sm:w-40">
          <Label htmlFor="filtro-anio-alumno" className="sr-only">
            Filtrar por año
          </Label>
          <Select
            value={anio}
            onValueChange={(value) => {
              if (value === "todos" || value === "1" || value === "2" || value === "3" || value === "4") {
                onAnioChange(value);
              }
            }}
          >
            <SelectTrigger id="filtro-anio-alumno" aria-label="Filtrar por año">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANIO_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:w-40">
          <Label htmlFor="filtro-cuota" className="sr-only">
            Filtrar por cuota
          </Label>
          <Select
            value={cuota}
            onValueChange={(value) => {
              if (value === "todas" || value === "aldia" || value === "noaldia") {
                onCuotaChange(value);
              }
            }}
          >
            <SelectTrigger id="filtro-cuota" aria-label="Filtrar por cuota">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUOTA_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="incluir-bajas"
            checked={incluirBajas}
            onCheckedChange={onIncluirBajasChange}
          />
          <Label htmlFor="incluir-bajas" className="text-sm font-normal">
            Incluir bajas
          </Label>
        </div>

        {hasFilters ? (
          <Button type="button" variant="ghost" onClick={onClear}>
            Limpiar filtros
          </Button>
        ) : null}
      </div>
    </div>
  );
}
