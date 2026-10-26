"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  Menu,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

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
import { cn } from "@/lib/utils";

const INSTITUTO = "Instituto Privado de Merlo";
const CARRERA = "Profesorado de Educación Física";
const UBICACION = "Merlo, Buenos Aires";
const CICLO = "Ciclo lectivo 2026";

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavEntry[] = [
  { href: "/", label: "Tablero", icon: LayoutDashboard },
  { href: "/comisiones", label: "Materias", icon: BookOpen },
  { href: "/alumnos", label: "Alumnos", icon: Users },
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
          {INSTITUTO}
        </span>
        <span className="block text-xs leading-snug text-muted-foreground">{CARRERA}</span>
      </span>
    </Link>
  );
}

function BrandPhoto() {
  return (
    <div className="mb-3 overflow-hidden rounded-md border border-border bg-background">
      <Image
        src="/brand/hero-terciario.jpg"
        alt="Estudiantes del Profesorado de Educación Física"
        width={640}
        height={413}
        loading="eager"
        className="h-24 w-full object-cover"
      />
      <p className="px-3 py-2 text-xs text-pretty text-muted-foreground">
        {CARRERA} · {UBICACION}
      </p>
    </div>
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
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {entry.label}
    </Link>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-border p-3">
      <BrandPhoto />
      <ThemeToggle />
      <p className="flex items-center gap-2 px-3 pt-2 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        {CICLO}
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname.endsWith("/asistencia")) {
    return <div className="min-h-screen bg-muted/30">{children}</div>;
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
        <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((entry) => (
            <NavItem key={entry.href} entry={entry} active={isActive(pathname, entry.href)} />
          ))}
        </nav>
        <SidebarFooter />
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
              <div className="mt-6">
                <BrandPhoto />
              </div>
              <p className="flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {CICLO}
              </p>
            </SheetContent>
          </Sheet>
          <Brand compact />
          <div className="ml-auto">
            <ThemeToggle compact />
          </div>
        </header>

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
