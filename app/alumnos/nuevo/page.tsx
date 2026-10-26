import type { Metadata } from "next";

import { FormularioAlumno } from "@/components/alumnos/formulario-alumno";
import { clases, comisiones } from "@/lib/mock/data";

export const metadata: Metadata = {
  title: "Nuevo alumno",
};

export default function NuevoAlumnoPage() {
  return <FormularioAlumno comisiones={comisiones} clases={clases} />;
}
