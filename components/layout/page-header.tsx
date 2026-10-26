import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {description !== undefined ? (
          <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions !== undefined ? (
        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">{actions}</div>
      ) : null}
    </header>
  );
}
