"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowDown01Icon,
  Folder01Icon,
  LegalDocument01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProjects } from "@/lib/api/hooks";
import { getResumeStep } from "@/lib/domain/steps";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Past this the panel stops being scannable and the list should be opened. */
const LIST_LIMIT = 8;

function MaterialList() {
  const projects = useProjects();
  const pathname = usePathname();

  if (projects.isPending) {
    return (
      <div className="flex flex-col gap-1.5 py-1.5 pl-9">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3.5 w-3/5" />
      </div>
    );
  }
  // A failed list is already reported on the page itself; stay quiet here.
  if (projects.isError) return null;

  // Nothing to disclose yet; the empty state lives on the list page itself.
  if (!projects.data.length) return null;

  const recent = [...projects.data]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, LIST_LIMIT);

  return (
    <ul className="flex max-h-64 flex-col gap-0.5 overflow-y-auto py-0.5">
      {recent.map((project) => {
        const active = pathname.startsWith(routes.project(project.id));
        return (
          <li key={project.id}>
            <Link
              href={routes.step(project.id, getResumeStep(project))}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-8 items-center gap-2 rounded-lg pr-2 pl-9 text-2sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                active
                  ? "bg-white/55 font-semibold text-foreground dark:bg-white/10"
                  : "text-muted-foreground hover:bg-white/45 hover:text-foreground dark:hover:bg-white/8",
              )}
            >
              <HugeiconsIcon
                icon={LegalDocument01Icon}
                strokeWidth={2}
                size={14}
                aria-hidden="true"
                className="shrink-0"
              />
              <span className="min-w-0 truncate">{project.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The side panel the header's menu button opens and shuts. Shut, it stays an
 * icon rail; open, the two entries carry labels and the workspace expands to
 * the materials underneath.
 *
 * The row itself stays a link to the full list — the chevron beside it is a
 * separate control, so "go there" and "show me what's inside" never compete
 * for the same click.
 */
export function AppSidebar({
  id,
  collapsed,
  className,
}: {
  id?: string;
  collapsed: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const onMaterials = pathname === routes.materials();

  const newMaterial = (
    <Button
      nativeButton={false}
      render={<Link href={routes.newProject()} />}
      size={collapsed ? "icon" : "lg"}
      className={cn(collapsed ? "size-10 rounded-full" : "w-full")}
    >
      <HugeiconsIcon
        icon={Add01Icon}
        strokeWidth={2}
        data-icon={collapsed ? undefined : "inline-start"}
      />
      <span className={cn(collapsed && "sr-only")}>새로 생성하기</span>
    </Button>
  );

  const materialsLink = (
    <Link
      href={routes.materials()}
      aria-current={onMaterials ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-2.5 rounded-lg text-2sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
        collapsed
          ? "w-10 justify-center rounded-full"
          : "min-w-0 flex-1 px-2.5",
        "group-hover/row:text-foreground",
        onMaterials ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <HugeiconsIcon
        icon={Folder01Icon}
        strokeWidth={2}
        size={19}
        aria-hidden="true"
        className="shrink-0"
      />
      <span className={cn("min-w-0 truncate", collapsed && "sr-only")}>
        내 작업함
      </span>
    </Link>
  );

  if (collapsed) {
    return (
      <aside
        id={id}
        className={cn(
          "flex w-16 shrink-0 flex-col items-center gap-5 border-r border-hairline px-3 py-4",
          className,
        )}
      >
        <Tooltip>
          <TooltipTrigger render={<span className="contents" />}>
            {newMaterial}
          </TooltipTrigger>
          <TooltipContent side="right">새로 생성하기</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<span className="group/row contents" />}>
            <span className="rounded-full transition-colors hover:bg-white/45 dark:hover:bg-white/8">
              {materialsLink}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right">내 작업함</TooltipContent>
        </Tooltip>
      </aside>
    );
  }

  return (
    <aside
      id={id}
      className={cn(
        "flex w-60 shrink-0 flex-col gap-5 border-r border-hairline px-3 py-4",
        className,
      )}
    >
      {newMaterial}

      <nav aria-label="주요 메뉴" className="flex min-h-0 flex-col">
        {/*
          One box, two controls: the label navigates, the chevron discloses.
          Nesting a button inside the anchor would be invalid HTML, so they
          sit side by side and the box carries the hover.
        */}
        <div className="group/row flex items-center rounded-lg pr-1.5 transition-colors hover:bg-white/45 dark:hover:bg-white/8">
          {materialsLink}
          {/*
            A plain button, not the Button component: that one lays a press
            dim over itself, and this control should not shift its background
            at all — only the chevron turns.
          */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="sidebar-materials"
            aria-label={open ? "내 작업함 접기" : "내 작업함 펼치기"}
            onClick={() => setOpen((value) => !value)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              size={16}
              className={cn("transition-transform", !open && "-rotate-90")}
            />
          </button>
        </div>

        <div id="sidebar-materials" hidden={!open} className="min-h-0">
          <MaterialList />
        </div>
      </nav>
    </aside>
  );
}
