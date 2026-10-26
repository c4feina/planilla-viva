import type { Condicion } from "@/lib/types";

export const CONDICION_LABELS: Record<Condicion, string> = {
  cursando: "Cursando",
  regular: "Regular",
  libre: "Libre",
  aprobada: "Aprobada",
  recursa: "Recursa",
};

export const CONDICION_COLORS: Record<Condicion, string> = {
  cursando: "text-muted-foreground",
  regular: "text-emerald-700 dark:text-emerald-400",
  libre: "text-red-700 dark:text-red-400",
  aprobada: "text-blue-700 dark:text-blue-400",
  recursa: "text-amber-700 dark:text-amber-400",
};
