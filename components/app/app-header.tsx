import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

import { BrandLink } from "./brand";

/** Header for screens outside a project: the list and the new-project form. */
export function AppHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
        <BrandLink />
        <div className="ml-auto flex items-center gap-1.5">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
