"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "planilla-viva-theme";

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");

  try {
    window.localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  } catch {
    // El tema sigue funcionando aunque el navegador bloquee el almacenamiento.
  }
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon" : "sm"}
      onClick={toggleTheme}
      aria-label="Cambiar entre modo claro y modo oscuro"
      title="Cambiar entre modo claro y modo oscuro"
      className={compact ? undefined : "w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"}
    >
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
      {compact ? null : (
        <span>
          <span className="dark:hidden">Modo oscuro</span>
          <span className="hidden dark:inline">Modo claro</span>
        </span>
      )}
    </Button>
  );
}
