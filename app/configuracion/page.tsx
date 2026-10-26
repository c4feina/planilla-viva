import type { Metadata } from "next";

import { ConfiguracionAcademica } from "@/components/configuracion/configuracion-academica";

export const metadata: Metadata = {
  title: "Configuración",
};

export default function ConfiguracionPage() {
  return <ConfiguracionAcademica />;
}
