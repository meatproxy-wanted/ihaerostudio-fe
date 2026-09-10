"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ShowcaseSectionProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ShowcaseSection({
  id,
  title,
  description,
  children,
}: ShowcaseSectionProps) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-4">
      <div className="flex flex-col gap-0.5 px-1">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="text-2sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

type ShowcaseCaseProps = {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export function ShowcaseCase({
  label,
  description,
  children,
  className,
  actions,
}: ShowcaseCaseProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-hairline">
      <div className="flex min-h-11 items-center gap-2 px-2 py-1.5">
        <span className="inline-flex h-7 items-center rounded-[7px] bg-secondary px-2 text-2sm font-semibold text-foreground shadow-[inset_0_0_0_0.5px_var(--hairline)]">
          {label}
        </span>
        {description && (
          <span className="truncate text-xs font-medium text-muted-foreground">
            {description}
          </span>
        )}
        {actions && <div className="ml-auto flex items-center">{actions}</div>}
      </div>
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 px-4 pt-2 pb-4",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
