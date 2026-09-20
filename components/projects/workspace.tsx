"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { ProjectList } from "@/components/projects/project-list";
import { useSearchParamsSync } from "@/hooks/use-search-params-sync";

/**
 * The material list inside the app chrome. All it adds to the shell is the
 * search term, which is seeded from the address bar and mirrored back into
 * it, so a filtered view survives a reload and can be shared as a link.
 */
export function Workspace() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  useSearchParamsSync({ q: query.trim() || null });

  return (
    <AppShell search={{ query, onQueryChange: setQuery }}>
      <ProjectList query={query.trim()} />
    </AppShell>
  );
}
