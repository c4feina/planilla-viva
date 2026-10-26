"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function QuickSearch({ onSearch }: { onSearch?: () => void }) {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();

    router.push(value === "" ? "/alumnos" : `/alumnos?q=${encodeURIComponent(value)}`);
    setQuery("");
    onSearch?.();
  }

  return (
    <form role="search" onSubmit={handleSubmit}>
      <Label htmlFor={inputId} className="sr-only">
        Buscar alumno por nombre, apellido o DNI
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar alumno"
          autoComplete="off"
          enterKeyHint="search"
          className="pl-9"
        />
      </div>
    </form>
  );
}
