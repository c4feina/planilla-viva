import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDocentesLabel } from "@/lib/academic";
import { formatAnio } from "@/lib/format";
import type { Comision, Docente, UnidadCurricular } from "@/lib/types";

export function EncabezadoAsistencia({
  comision,
  unidad,
  docentes,
}: {
  comision: Comision;
  unidad: UnidadCurricular;
  docentes: readonly Docente[];
}) {
  return (
    <div className="mb-5 flex items-start gap-2">
      <Button asChild variant="ghost" size="icon" aria-label="Volver a la planilla">
        <Link href={`/comisiones/${comision.id}/planilla`}>
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div className="min-w-0 pt-1">
        <h1 className="text-xl font-semibold tracking-tight">Tomar asistencia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {unidad.nombre} · {formatAnio(comision.anio)} año
        </p>
        <p className="text-xs text-muted-foreground">{getDocentesLabel(docentes)}</p>
      </div>
    </div>
  );
}
