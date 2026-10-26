import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AsistenciaComision } from "@/components/asistencia/asistencia-comision";
import { parametrosAcademicos } from "@/lib/mock/data";
import { getComisionDetalle } from "@/lib/mock/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Tomar asistencia",
};

export default async function AsistenciaPage({ params }: PageProps) {
  const { id } = await params;
  const detalle = getComisionDetalle(id);

  if (detalle === null) {
    notFound();
  }

  return (
    <AsistenciaComision
      comision={detalle.comision}
      unidad={detalle.unidad}
      docentes={detalle.docentes}
      clases={detalle.clases}
      evaluaciones={detalle.evaluaciones}
      parametros={parametrosAcademicos}
    />
  );
}
