import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlanillaComision } from "@/components/planilla/planilla-comision";
import { getComisionDetalle } from "@/lib/mock/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detalle = getComisionDetalle(id);

  return {
    title: detalle === null ? "Materia" : detalle.unidad.nombre,
  };
}

export default async function PlanillaPage({ params }: PageProps) {
  const { id } = await params;
  const detalle = getComisionDetalle(id);

  if (detalle === null) {
    notFound();
  }

  return (
    <PlanillaComision
      comision={detalle.comision}
      unidad={detalle.unidad}
      docentes={detalle.docentes}
    />
  );
}
