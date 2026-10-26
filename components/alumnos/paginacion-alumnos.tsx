import { Button } from "@/components/ui/button";
import { formatNumero } from "@/lib/format";

export function PaginacionAlumnos({
  page,
  totalPages,
  total,
  desde,
  hasta,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="Paginación de alumnos"
      className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-muted-foreground">
        Mostrando {formatNumero(desde)}–{formatNumero(hasta)} de {formatNumero(total)} alumnos
      </p>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="text-xs text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}
