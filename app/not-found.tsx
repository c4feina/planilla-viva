import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-96 flex-col items-start justify-center gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Página no encontrada</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          La dirección que buscás no existe o la materia ya no está disponible.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/comisiones">Volver a materias</Link>
      </Button>
    </div>
  );
}
