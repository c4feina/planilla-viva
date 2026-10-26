import type { Metadata } from "next";

import { Tablero } from "@/components/tablero/tablero";
import {
  comisiones,
  docentes,
  evaluaciones,
  unidadesCurriculares,
} from "@/lib/mock/data";

export const metadata: Metadata = {
  title: "Tablero",
};

export default function TableroPage() {
  return (
    <Tablero
      comisiones={comisiones}
      unidades={unidadesCurriculares}
      docentes={docentes}
      evaluaciones={evaluaciones}
    />
  );
}
