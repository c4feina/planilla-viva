import type { Metadata } from "next";

import { FormularioAlumno } from "@/components/alumnos/formulario-alumno";
import { clases, comisiones } from "@/lib/mock/data";

export const metadata: Metadata = {
  title: "Editar alumno",
};

export default async function EditarAlumnoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <FormularioAlumno alumnoId={id} comisiones={comisiones} clases={clases} />;
}
