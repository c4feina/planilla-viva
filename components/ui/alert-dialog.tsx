"use client";

import { Button } from "@/components/ui/button";

export function AlertDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={(node) => {
        if (node !== null && !node.open) {
          node.showModal();
        }
      }}
      role="alertdialog"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      className="m-auto w-11/12 max-w-md rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
    >
      <div className="p-5">
        <h2 id="alert-dialog-title" className="text-base font-semibold">
          {title}
        </h2>
        <p id="alert-dialog-description" className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
