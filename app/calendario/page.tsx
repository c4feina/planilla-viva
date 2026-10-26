import type { Metadata } from "next";

import { CalendarioAcademico } from "@/components/calendario/calendario-academico";
import { comisiones, docentes, unidadesCurriculares } from "@/lib/mock/data";

export const metadata: Metadata = {
  title: "Calendario",
};

export default function CalendarioPage() {
  return (
    <CalendarioAcademico
      comisiones={comisiones}
      unidades={unidadesCurriculares}
      docentes={docentes}
    />
  );
}
