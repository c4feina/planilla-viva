import { Button } from "@/components/ui/button";

export function BarraGuardado({
  presentCount,
  total,
  horas,
  fecha,
  status,
  saveLabel,
  hasChanges,
  onSave,
}: {
  presentCount: number;
  total: number;
  horas: number;
  fecha: string;
  status: string | null;
  saveLabel: string;
  hasChanges: boolean;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background px-4 py-3">
      <div className="mx-auto w-full max-w-md space-y-2">
        {status !== null ? (
          <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {status}
          </p>
        ) : null}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {presentCount} de {total} · {horas} h
          </span>
          <span>{fecha === "" ? "Sin fecha" : fecha}</span>
        </div>
        <Button type="button" className="w-full" disabled={!hasChanges} onClick={onSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
