"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Menu01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { BrandLink } from "@/components/app/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

/**
 * The workspace bar: the sidebar toggle, the brand, and a search that filters
 * the material list. It spans the full width above both columns so the toggle
 * keeps its place whether the sidebar is open or shut.
 */
export function WorkspaceHeader({
  collapsed,
  onToggle,
  query,
  onQueryChange,
}: {
  collapsed: boolean;
  onToggle: () => void;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <header
      data-slot="workspace-header"
      className="sticky top-0 z-20 border-b border-hairline"
    >
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-expanded={!collapsed}
            aria-controls="workspace-sidebar"
            aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
            className="shrink-0 text-muted-foreground focus-visible:border-transparent focus-visible:ring-0 aria-expanded:bg-transparent"
            onClick={onToggle}
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
          </Button>

          {/* Symbol only on narrow bars, the full wordmark once there is room. */}
          <BrandLink compact className="sm:hidden" />
          <BrandLink className="hidden sm:flex" />
        </div>

        {/* Equal flex on both sides puts the field on the viewport centre. */}
        <div className="relative w-full max-w-md shrink">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="자료 검색"
            aria-label="자료 검색"
            autoComplete="off"
            spellCheck={false}
            className="h-10 w-full rounded-full bg-secondary pr-10 pl-11 text-2sm font-medium transition-[background-color,box-shadow] outline-none placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/25 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="검색어 지우기"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full text-muted-foreground"
              onClick={() => onQueryChange("")}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </Button>
          )}
        </div>

        {/* Balances the left group so the search sits on the viewport centre,
            and gives the theme toggle a home now that the panel is two items. */}
        <div className="flex flex-1 items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
