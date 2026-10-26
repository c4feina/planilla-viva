import type { Metadata } from "next";

import { FichaAlumno } from "@/components/alumnos/ficha-alumno";
import { getAlumnoNombre } from "@/lib/alumnos";
import { alumnos, comisiones, unidadesCurriculares } from "@/lib/mock/data";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creado?: string; actualizado?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const alumno = alumnos.find((item) => item.id === id);

  return { title: alumno === undefined ? "Alumno" : getAlumnoNombre(alumno) };
}

export default async function AlumnoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const mensaje =
    query.creado === "1"
      ? "Alumno creado"
      : query.actualizado === "1"
        ? "Cambios guardados"
        : undefined;

  return (
    <FichaAlumno
      alumnoId={id}
      comisiones={comisiones}
      unidades={unidadesCurriculares}
      mensaje={mensaje}
    />
  );
}
