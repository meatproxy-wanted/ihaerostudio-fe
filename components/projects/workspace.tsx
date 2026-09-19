"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { AppSidebar } from "@/components/app/app-sidebar";
import { WorkspaceHeader } from "@/components/app/workspace-header";
import { ProjectList } from "@/components/projects/project-list";
import { useSearchParamsSync } from "@/hooks/use-search-params-sync";

/**
 * Owns what the header and the two columns share: whether the panel is open,
 * and what the producer is searching for. The query is seeded from the
 * address bar and mirrored back into it, so a filtered view survives a
 * reload and can be shared as a link.
 */
export function Workspace() {
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(true);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  useSearchParamsSync({ q: query.trim() || null });

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <WorkspaceHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        query={query}
        onQueryChange={setQuery}
      />
      <div className="flex min-h-0 flex-1">
        <AppSidebar
          id="workspace-sidebar"
          collapsed={collapsed}
          className="sticky top-14 h-[calc(100svh-3.5rem)]"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <ProjectList query={query.trim()} />
        </div>
      </div>
    </div>
  );
}
