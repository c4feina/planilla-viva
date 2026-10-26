import type { Metadata } from "next";

import { ListadoAlumnos } from "@/components/alumnos/listado-alumnos";
import type { FiltroCuota } from "@/lib/selectores";

export const metadata: Metadata = {
  title: "Alumnos",
};

type PageProps = {
  searchParams: Promise<{ q?: string; cuota?: string }>;
};

export default async function AlumnosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const initialCuota: FiltroCuota =
    params.cuota === "aldia" || params.cuota === "noaldia" ? params.cuota : "todas";

  return (
    <ListadoAlumnos
      key={`${initialQuery}-${initialCuota}`}
      initialQuery={initialQuery}
      initialCuota={initialCuota}
    />
  );
}
