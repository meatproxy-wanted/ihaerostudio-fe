"use client";

import { useState, type ReactNode } from "react";

import { AppSidebar } from "@/components/app/app-sidebar";
import {
  WorkspaceHeader,
  type ShellSearch,
} from "@/components/app/workspace-header";

/**
 * The chrome every screen outside a project wears: the bar, the panel, and
 * the column they leave for the page. It owns whether the panel is open,
 * which is the one piece of state the bar and the panel share.
 *
 * `search` is passed only by screens that have something to filter — the
 * material list. Elsewhere the bar carries the toggle, the brand and the
 * theme switch, and the field does not appear at all rather than sitting
 * there doing nothing.
 */
export function AppShell({
  children,
  search,
}: {
  children: ReactNode;
  search?: ShellSearch;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="app-wash flex min-h-svh flex-col bg-background">
      <WorkspaceHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        search={search}
      />
      <div className="flex min-h-0 flex-1">
        <AppSidebar
          id="workspace-sidebar"
          collapsed={collapsed}
          className="sticky top-14 h-[calc(100svh-3.5rem)]"
        />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
