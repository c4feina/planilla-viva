import { Button } from "@/components/ui/button";

export function ResumenAsistencia({
  presentCount,
  total,
  computable,
  onSetAll,
}: {
  presentCount: number;
  total: number;
  computable: boolean;
  onSetAll: (value: boolean) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-lg font-semibold">
        {presentCount} de {total} presentes
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!computable}
          onClick={() => onSetAll(true)}
        >
          Todos presentes
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!computable}
          onClick={() => onSetAll(false)}
        >
          Todos ausentes
        </Button>
      </div>
    </div>
  );
}
