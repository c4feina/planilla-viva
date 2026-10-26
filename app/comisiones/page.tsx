import type { Metadata } from "next";

import { ListadoComisiones } from "@/components/comisiones/listado-comisiones";
import {
  comisiones,
  docentes,
  unidadesCurriculares,
} from "@/lib/mock/data";

export const metadata: Metadata = {
  title: "Materias",
};

export default function ComisionesPage() {
  return (
    <ListadoComisiones
      comisiones={comisiones}
      unidades={unidadesCurriculares}
      docentes={docentes}
    />
  );
}
