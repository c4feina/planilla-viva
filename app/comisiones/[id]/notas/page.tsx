import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NotasComision } from "@/components/notas/notas-comision";
import { getComisionDetalle } from "@/lib/mock/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detalle = getComisionDetalle(id);

  return {
    title: detalle === null ? "Notas" : `Notas · ${detalle.unidad.nombre}`,
  };
}

export default async function NotasPage({ params }: PageProps) {
  const { id } = await params;
  const detalle = getComisionDetalle(id);

  if (detalle === null) {
    notFound();
  }

  return (
    <NotasComision
      comision={detalle.comision}
      unidad={detalle.unidad}
      docentes={detalle.docentes}
    />
  );
}
