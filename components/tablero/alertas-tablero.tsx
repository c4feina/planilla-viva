import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  UserMinus,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { formatNumero } from "@/lib/format";
import type { AlertasTablero as AlertasTableroData } from "@/lib/selectores";
import { cn } from "@/lib/utils";

type Tone = "critical" | "warning" | "info" | "ok";

const TONE_CLASSES: Record<Tone, { border: string; icon: string; link: string }> = {
  critical: {
    border: "border-l-destructive",
    icon: "bg-destructive/10 text-destructive",
    link: "text-destructive",
  },
  warning: {
    border: "border-l-amber-500",
    icon: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    link: "text-amber-800 dark:text-amber-300",
  },
  info: {
    border: "border-l-sky-500",
    icon: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    link: "text-sky-800 dark:text-sky-300",
  },
  ok: {
    border: "border-l-emerald-500",
    icon: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    link: "text-emerald-800 dark:text-emerald-300",
  },
};

function AlertCard({
  title,
  value,
  context,
  href,
  linkLabel,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  context: string;
  href: string;
  linkLabel: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  const resolvedTone: Tone = value === 0 ? "ok" : tone;
  const styles = TONE_CLASSES[resolvedTone];

  return (
    <div
      className={cn(
        "flex flex-col rounded-md border border-border border-l-4 bg-background p-4",
        styles.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {title}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatNumero(value)}</p>
          <p className="mt-1 text-xs text-pretty text-muted-foreground">{context}</p>
        </div>
        <span className={cn("rounded-md p-2", styles.icon)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <Link
        href={href}
        className={cn(
          "mt-4 inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline",
          styles.link,
        )}
      >
        {linkLabel}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function AlertasTablero({ alertas }: { alertas: AlertasTableroData }) {
  return (
    <section aria-labelledby="alertas-tablero" className="mb-8">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="alertas-tablero" className="text-base font-semibold">
            Atención
          </h2>
          <p className="text-sm text-muted-foreground">
            Señales para revisar antes de cerrar la semana.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Ciclo lectivo 2026 · Solo lectura</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <AlertCard
          title="Alumnos con materias libres"
          value={alertas.alumnosConLibres}
          context={`${formatNumero(alertas.cursadasLibres)} cursadas en condición libre`}
          href="#estado-comisiones"
          linkLabel="Ver estado por materia"
          icon={UserMinus}
          tone="critical"
        />
        <AlertCard
          title="Notas sin cargar"
          value={alertas.notasPendientes}
          context={`${formatNumero(alertas.docentesPendientes)} docentes con evaluaciones pendientes`}
          href="#docentes-pendientes"
          linkLabel="Ver docentes"
          icon={ClipboardList}
          tone="warning"
        />
        <AlertCard
          title="Cuotas impagas"
          value={alertas.cuotasImpagas}
          context="Alumnos activos marcados como no al día por administración"
          href="/alumnos?cuota=noaldia"
          linkLabel="Ver alumnos"
          icon={Wallet}
          tone="info"
        />
      </div>
    </section>
  );
}
