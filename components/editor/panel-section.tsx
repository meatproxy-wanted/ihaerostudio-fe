import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** A titled block in the editor's tool panel. */
export function PanelSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-2.5 px-4 py-4", className)}>
      <h3 className="text-2sm font-semibold text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}
