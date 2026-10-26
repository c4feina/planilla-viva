"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAcademicDispatch } from "@/lib/store/academic-store";

export function DemoBanner() {
  const dispatch = useAcademicDispatch();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border bg-muted/40">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 md:px-8">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Demo</span> · Datos ficticios. Los cambios
          se guardan en este navegador.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setOpen(true)}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reiniciar datos
        </Button>
      </div>

      <AlertDialog
        open={open}
        title="Reiniciar la demo"
        description="Se vuelven a cargar los datos ficticios originales. Se pierden las notas, asistencias y cambios de esta sesión."
        confirmLabel="Reiniciar"
        onConfirm={() => dispatch({ type: "reset" })}
        onOpenChange={setOpen}
      />
    </div>
  );
}
