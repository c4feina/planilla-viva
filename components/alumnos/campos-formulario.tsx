"use client";

import { CampoTexto } from "@/components/alumnos/campo-formulario";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseAnioCursada } from "@/lib/alumnos";
import { formatAnio } from "@/lib/format";
import type { AnioCursada } from "@/lib/types";
import type { AlumnoFormErrors, AlumnoFormValues } from "@/lib/validaciones";

const ANIOS: AnioCursada[] = [1, 2, 3, 4];

export function CamposFormulario({
  values,
  errors,
  esEdicion,
  legajoSugerido,
  onChange,
}: {
  values: AlumnoFormValues;
  errors: AlumnoFormErrors;
  esEdicion: boolean;
  legajoSugerido: string;
  onChange: <K extends keyof AlumnoFormValues>(key: K, value: AlumnoFormValues[K]) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoTexto
          id="apellido"
          label="Apellido"
          value={values.apellido}
          onChange={(value) => onChange("apellido", value)}
          error={errors.apellido}
        />
        <CampoTexto
          id="nombre"
          label="Nombre"
          value={values.nombre}
          onChange={(value) => onChange("nombre", value)}
          error={errors.nombre}
        />
        <CampoTexto
          id="dni"
          label="DNI"
          value={values.dni}
          onChange={(value) => onChange("dni", value)}
          error={errors.dni}
          hint="8 dígitos, sin puntos."
          inputMode="numeric"
          maxLength={8}
        />
        <CampoTexto
          id="legajo"
          label="Legajo"
          value={values.legajo}
          onChange={(value) => onChange("legajo", value)}
          error={errors.legajo}
          hint={
            esEdicion ? "Numérico y único." : `Numérico y único. Sugerido: ${legajoSugerido}.`
          }
          inputMode="numeric"
        />
      </div>

      {esEdicion ? (
        <CampoTexto
          id="anio-cursada"
          label="Año de cursada"
          value={formatAnio(values.anioCursada)}
          readOnly
          hint="Para cambiar de año se requiere una nueva inscripción."
        />
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="anio-cursada">Año de cursada</Label>
          <Select
            value={String(values.anioCursada)}
            onValueChange={(value) => {
              const anio = parseAnioCursada(value);

              if (anio !== null) {
                onChange("anioCursada", anio);
              }
            }}
          >
            <SelectTrigger
              id="anio-cursada"
              aria-describedby={errors.anioCursada === undefined ? undefined : "anio-cursada-error"}
              aria-invalid={errors.anioCursada === undefined ? undefined : true}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANIOS.map((anio) => (
                <SelectItem key={anio} value={String(anio)}>
                  {formatAnio(anio)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.anioCursada === undefined ? null : (
            <p id="anio-cursada-error" role="alert" className="text-xs text-destructive">
              {errors.anioCursada}
            </p>
          )}
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Cuota al día</legend>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              id="cuota-si"
              type="radio"
              name="cuota"
              checked={values.cuotaAlDia}
              onChange={() => onChange("cuotaAlDia", true)}
              className="size-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
            Sí
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              id="cuota-no"
              type="radio"
              name="cuota"
              checked={!values.cuotaAlDia}
              onChange={() => onChange("cuotaAlDia", false)}
              className="size-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
            No
          </label>
        </div>
      </fieldset>
    </>
  );
}
