import type { CursadaConAlumno } from "@/lib/academic";
import type { Clase } from "@/lib/types";

function countPresences(rows: readonly CursadaConAlumno[], clase: Clase): number {
  return rows.reduce((total, row) => {
    const marca = row.cursada.marcas[clase.id];
    return total + (marca === "P" || marca === "T" ? 1 : 0);
  }, 0);
}

export function PiePlanilla({
  rows,
  clases,
}: {
  rows: readonly CursadaConAlumno[];
  clases: readonly Clase[];
}) {
  return (
    <tfoot>
      <tr className="border-t border-border bg-muted/40">
        <th
          scope="row"
          className="sticky left-0 bg-muted px-3 py-2 text-left text-xs font-medium text-muted-foreground"
        >
          Presencias por clase
        </th>
        {clases.map((clase) => (
          <td
            key={clase.id}
            className="px-1 py-2 text-center text-xs tabular-nums text-muted-foreground"
          >
            {clase.tipo === "normal" ? `${countPresences(rows, clase)}/${rows.length}` : "–"}
          </td>
        ))}
        <td />
        <td />
        <td />
      </tr>
    </tfoot>
  );
}
