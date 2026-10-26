import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CampoTexto({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  inputMode,
  maxLength,
  readOnly = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  type?: "text" | "email" | "tel";
  inputMode?: "text" | "numeric";
  maxLength?: number;
  readOnly?: boolean;
}) {
  const describedBy =
    [hint === undefined ? null : `${id}-hint`, error === undefined ? null : `${id}-error`]
      .filter((item): item is string => item !== null)
      .join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        readOnly={readOnly}
        value={value}
        onChange={
          onChange === undefined
            ? undefined
            : (event) => {
                onChange(event.target.value);
              }
        }
        aria-invalid={error === undefined ? undefined : true}
        aria-describedby={describedBy}
        className={readOnly ? "bg-muted/40 text-muted-foreground" : undefined}
      />
      {hint === undefined ? null : (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error === undefined ? null : (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
