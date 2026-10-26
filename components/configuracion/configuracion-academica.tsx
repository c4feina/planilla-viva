"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, Info, Landmark, Wallet } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUOTA, INSTITUTO } from "@/lib/institucion";
import { useAcademicDispatch, useAcademicStore } from "@/lib/store/academic-store";

const TARDANZA_OPTIONS = [
  { value: "0", label: "No computa" },
  { value: "0.25", label: "Computa 1/4 de la hora" },
  { value: "0.5", label: "Computa 1/2 de la hora" },
  { value: "1", label: "Computa la hora completa" },
] as const;

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof CalendarDays;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function ConfiguracionAcademica() {
  const { parametros, ciclo, cursadas } = useAcademicStore();
  const dispatch = useAcademicDispatch();
  const [porcentaje, setPorcentaje] = useState(String(parametros.porcentajeMinimoAsistencia));
  const [aprobacion, setAprobacion] = useState(String(parametros.notaAprobacion));
  const [promocion, setPromocion] = useState(String(parametros.notaPromocion));
  const [justificada, setJustificada] = useState(parametros.justificadaComputa);
  const [tardanza, setTardanza] = useState(String(parametros.tardanzaFraccion));
  const [anio, setAnio] = useState(String(ciclo.anio));
  const [inicio, setInicio] = useState(ciclo.inicio);
  const [fin, setFin] = useState(ciclo.fin);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (dirty) {
      return;
    }

    // Sincroniza el formulario cuando la demo termina de hidratar el almacenamiento.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPorcentaje(String(parametros.porcentajeMinimoAsistencia));
    setAprobacion(String(parametros.notaAprobacion));
    setPromocion(String(parametros.notaPromocion));
    setJustificada(parametros.justificadaComputa);
    setTardanza(String(parametros.tardanzaFraccion));
    setAnio(String(ciclo.anio));
    setInicio(ciclo.inicio);
    setFin(ciclo.fin);
  }, [parametros, ciclo, dirty]);

  function markDirty() {
    setDirty(true);
    setStatus(null);
  }

  function handleSave() {
    const errores: string[] = [];
    const porcentajeNumero = Number(porcentaje);
    const aprobacionNumero = Number(aprobacion);
    const promocionNumero = Number(promocion);
    const anioNumero = Number(anio);

    if (!Number.isFinite(porcentajeNumero) || porcentajeNumero < 0 || porcentajeNumero > 100) {
      errores.push("El porcentaje de asistencia debe estar entre 0 y 100.");
    }

    if (!Number.isFinite(aprobacionNumero) || aprobacionNumero < 1 || aprobacionNumero > 10) {
      errores.push("La nota de aprobación debe estar entre 1 y 10.");
    }

    if (!Number.isFinite(promocionNumero) || promocionNumero < 1 || promocionNumero > 10) {
      errores.push("La nota de promoción debe estar entre 1 y 10.");
    }

    if (promocionNumero < aprobacionNumero) {
      errores.push("La nota de promoción no puede ser menor que la de aprobación.");
    }

    if (!Number.isInteger(anioNumero) || anioNumero < 2000 || anioNumero > 2100) {
      errores.push("El año del ciclo lectivo no es válido.");
    }

    if (inicio === "" || fin === "") {
      errores.push("Completá el inicio y el fin del ciclo lectivo.");
    } else if (fin < inicio) {
      errores.push("El fin del ciclo no puede ser anterior al inicio.");
    }

    if (errores.length > 0) {
      setStatus({ text: errores[0] ?? "Revisá los datos.", error: true });
      return;
    }

    dispatch({
      type: "updateParametros",
      parametros: {
        porcentajeMinimoAsistencia: porcentajeNumero,
        notaAprobacion: aprobacionNumero,
        notaPromocion: promocionNumero,
        justificadaComputa: justificada,
        tardanzaFraccion: Number(tardanza),
      },
    });
    dispatch({
      type: "updateCiclo",
      ciclo: { anio: anioNumero, inicio, fin },
    });
    setDirty(false);
    setStatus({
      text: `Configuración guardada. Se recalcularon ${cursadas.length} cursadas.`,
      error: false,
    });
  }

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Reglas académicas y calendario del ciclo. Los cambios se aplican a todas las materias."
      />

      <div className="max-w-3xl">
        <Section
          title="Reglas académicas"
          description="Definen cómo se calcula la condición de cada alumno. Hasta que el instituto las confirme, quedan como valores de ejemplo."
          icon={Landmark}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="porcentaje-asistencia">Asistencia mínima (%)</Label>
              <Input
                id="porcentaje-asistencia"
                type="number"
                min={0}
                max={100}
                step={1}
                value={porcentaje}
                onChange={(event) => {
                  setPorcentaje(event.target.value);
                  markDirty();
                }}
                className="tabular-nums"
              />
              <p className="text-xs text-muted-foreground">
                Por debajo de este porcentaje, la cursada queda libre.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tardanza">Tardanza</Label>
              <Select
                value={tardanza}
                onValueChange={(value) => {
                  setTardanza(value);
                  markDirty();
                }}
              >
                <SelectTrigger id="tardanza" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARDANZA_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cuánto suma una tardanza al total de horas asistidas.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nota-aprobacion">Nota de aprobación</Label>
              <Input
                id="nota-aprobacion"
                type="number"
                min={1}
                max={10}
                step={1}
                value={aprobacion}
                onChange={(event) => {
                  setAprobacion(event.target.value);
                  markDirty();
                }}
                className="tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nota-promocion">Nota de promoción</Label>
              <Input
                id="nota-promocion"
                type="number"
                min={1}
                max={10}
                step={1}
                value={promocion}
                onChange={(event) => {
                  setPromocion(event.target.value);
                  markDirty();
                }}
                className="tabular-nums"
              />
              <p className="text-xs text-muted-foreground">
                Con este promedio, la materia queda aprobada.
              </p>
            </div>
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-md border border-border bg-background px-4 py-3">
            <Checkbox
              checked={justificada}
              onCheckedChange={(checked) => {
                setJustificada(checked === true);
                markDirty();
              }}
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium">Las justificaciones computan</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Si está activo, una falta justificada suma las horas de la clase.
              </span>
            </span>
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleSave} disabled={!dirty}>
              Guardar configuración
            </Button>
            {status === null ? null : (
              <p
                role="status"
                className={
                  status.error
                    ? "text-sm font-medium text-destructive"
                    : "text-sm font-medium text-emerald-700 dark:text-emerald-400"
                }
              >
                {status.text}
              </p>
            )}
          </div>
        </Section>

        <Section
          title="Calendario del ciclo"
          description="Fechas generales del ciclo lectivo. Las fechas de cada evaluación se cargan en la materia."
          icon={CalendarDays}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="anio-ciclo">Año</Label>
              <Input
                id="anio-ciclo"
                type="number"
                min={2000}
                max={2100}
                value={anio}
                onChange={(event) => {
                  setAnio(event.target.value);
                  markDirty();
                }}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inicio-ciclo">Inicio</Label>
              <Input
                id="inicio-ciclo"
                type="date"
                value={inicio}
                onChange={(event) => {
                  setInicio(event.target.value);
                  markDirty();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fin-ciclo">Fin</Label>
              <Input
                id="fin-ciclo"
                type="date"
                value={fin}
                onChange={(event) => {
                  setFin(event.target.value);
                  markDirty();
                }}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Datos institucionales"
          description="Identidad que se muestra en el sistema."
          icon={Info}
        >
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Institución</dt>
              <dd className="font-medium">{INSTITUTO.nombre}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Carrera</dt>
              <dd className="font-medium">{INSTITUTO.carrera}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Ubicación</dt>
              <dd className="font-medium">{INSTITUTO.ubicacion}</dd>
            </div>
          </dl>
        </Section>

        <Section
          title="Cuota"
          description="Dato administrativo, separado de la situación académica."
          icon={Wallet}
        >
          <p className="text-sm">
            Período de cuotas: <span className="font-medium">{CUOTA.desde} a {CUOTA.hasta}</span>.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{CUOTA.nota}</p>
        </Section>
      </div>
    </div>
  );
}
