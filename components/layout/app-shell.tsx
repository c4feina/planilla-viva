"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { DemoBanner } from "@/components/layout/demo-banner";
import { QuickSearch } from "@/components/layout/quick-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { INSTITUTO } from "@/lib/institucion";
import { useAcademicStore } from "@/lib/store/academic-store";
import { cn } from "@/lib/utils";

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavEntry[] = [
  { href: "/", label: "Tablero", icon: LayoutDashboard },
  { href: "/comisiones", label: "Materias", icon: BookOpen },
  { href: "/alumnos", label: "Alumnos", icon: Users },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/excel", label: "Excel", icon: FileSpreadsheet },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function Brand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link
        href="/"
        className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Image
          src="/brand/logo-ipm.png"
          alt=""
          width={36}
          height={36}
          priority
          className="size-9 shrink-0 rounded-sm border border-border bg-white object-contain p-0.5"
        />
        <span className="min-w-0">
          <span className="block text-sm leading-tight font-semibold">IPM</span>
          <span className="block text-xs leading-tight text-muted-foreground">Profesorado</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Image
        src="/brand/logo-ipm.png"
        alt=""
        width={48}
        height={48}
        priority
        className="size-12 shrink-0 rounded-sm border border-border bg-white object-contain p-1"
      />
      <span className="min-w-0">
        <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Planilla Viva
        </span>
        <span className="mt-0.5 block text-sm leading-snug font-semibold text-balance">
          {INSTITUTO.nombre}
        </span>
        <span className="block text-xs leading-snug text-muted-foreground">
          {INSTITUTO.carrera}
        </span>
      </span>
    </Link>
  );
}

function NavItem({
  entry,
  active,
  onClick,
}: {
  entry: NavEntry;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = entry.icon;

  return (
    <Link
      href={entry.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
      )}
    >
      <Icon className={cn("size-4", active && "text-primary")} aria-hidden="true" />
      {entry.label}
    </Link>
  );
}

function CycleFooter() {
  const { ciclo } = useAcademicStore();

  return (
    <div className="border-t border-border p-3">
      <ThemeToggle />
      <p className="flex items-center gap-2 px-3 pt-2 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        Ciclo lectivo {ciclo.anio}
      </p>
      <p className="px-3 pt-1 text-xs text-muted-foreground">Datos ficticios de demostración</p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname.endsWith("/asistencia")) {
    return (
      <div className="min-h-screen bg-muted/30">
        <DemoBanner />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <a
        href="#contenido"
        className="sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-2 focus:ring-ring focus:not-sr-only"
      >
        Saltar al contenido
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-background md:flex">
        <div className="border-b border-border px-4 py-4">
          <Brand />
        </div>
        <div className="border-b border-border px-3 py-3">
          <QuickSearch />
        </div>
        <nav
          aria-label="Navegación principal"
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
        >
          {NAV_ITEMS.map((entry) => (
            <NavItem key={entry.href} entry={entry} active={isActive(pathname, entry.href)} />
          ))}
        </nav>
        <CycleFooter />
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background px-4 md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú de navegación">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="pr-8">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <Brand />
              </SheetHeader>
              <div className="pb-4">
                <QuickSearch onSearch={() => setMobileMenuOpen(false)} />
              </div>
              <nav aria-label="Navegación principal" className="flex flex-col gap-1">
                {NAV_ITEMS.map((entry) => (
                  <SheetClose key={entry.href} asChild>
                    <NavItem entry={entry} active={isActive(pathname, entry.href)} />
                  </SheetClose>
                ))}
              </nav>
              <CycleFooter />
            </SheetContent>
          </Sheet>
          <Brand compact />
          <div className="ml-auto">
            <ThemeToggle compact />
          </div>
        </header>

        <DemoBanner />

        <main
          id="contenido"
          className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-8 md:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
