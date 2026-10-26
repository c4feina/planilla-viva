"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TipoClase } from "@/lib/types";

const CLASS_TYPES: readonly { value: TipoClase; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "cancelada", label: "Cancelada" },
  { value: "feriado", label: "Feriado" },
];

export function ControlesClase({
  fecha,
  tipo,
  horas,
  onFechaChange,
  onTipoChange,
  onHorasChange,
}: {
  fecha: string;
  tipo: TipoClase;
  horas: number;
  onFechaChange: (value: string) => void;
  onTipoChange: (value: TipoClase) => void;
  onHorasChange: (value: number) => void;
}) {
  function changeHours(delta: number) {
    const next = Math.min(4, Math.max(1, horas + delta));
    onHorasChange(next);
  }

  return (
    <div className="mb-5 space-y-4">
      <div>
        <Label htmlFor="fecha-clase">Fecha de la clase</Label>
        <Input
          id="fecha-clase"
          type="date"
          value={fecha}
          onChange={(event) => onFechaChange(event.target.value)}
          className="mt-1.5"
        />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Tipo de clase</legend>
        <div className="grid grid-cols-3 gap-2">
          {CLASS_TYPES.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={tipo === option.value ? "default" : "outline"}
              aria-pressed={tipo === option.value}
              onClick={() => onTipoChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Horas</legend>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Restar una hora"
            disabled={horas <= 1}
            onClick={() => changeHours(-1)}
          >
            −
          </Button>
          <span className="min-w-8 text-center text-base font-semibold tabular-nums">{horas}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Sumar una hora"
            disabled={horas >= 4}
            onClick={() => changeHours(1)}
          >
            +
          </Button>
        </div>
      </fieldset>
    </div>
  );
}
