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

const YEAR_OPTIONS = [
  { value: "todos", label: "Todos los años" },
  { value: "1", label: "1.º año" },
  { value: "2", label: "2.º año" },
  { value: "3", label: "3.º año" },
  { value: "4", label: "4.º año" },
] as const;

export type YearFilter = (typeof YEAR_OPTIONS)[number]["value"];

function isYearFilter(value: string): value is YearFilter {
  return YEAR_OPTIONS.some((option) => option.value === value);
}

export function FiltrosComisiones({
  query,
  year,
  hasFilters,
  onQueryChange,
  onYearChange,
  onClear,
}: {
  query: string;
  year: YearFilter;
  hasFilters: boolean;
  onQueryChange: (value: string) => void;
  onYearChange: (value: YearFilter) => void;
  onClear: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="buscar-comision" className="sr-only">
          Buscar por materia o docente
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="buscar-comision"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por materia o docente"
            className="pl-9"
            type="search"
          />
        </div>
      </div>

      <div className="sm:w-44">
        <Label htmlFor="filtro-anio" className="sr-only">
          Filtrar por año
        </Label>
        <Select
          value={year}
          onValueChange={(value) => {
            if (isYearFilter(value)) {
              onYearChange(value);
            }
          }}
        >
          <SelectTrigger id="filtro-anio" aria-label="Filtrar por año">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters ? (
        <Button type="button" variant="ghost" onClick={onClear}>
          Limpiar filtros
        </Button>
      ) : null}
    </div>
  );
}
