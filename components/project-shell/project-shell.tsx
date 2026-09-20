"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  LegalDocument01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";

import { AppSidebar } from "@/components/app/app-sidebar";
import StepBar from "@/components/ui/StepBar";
import { BrandLink } from "@/components/app/brand";
import { ErrorState } from "@/components/app/error-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiError } from "@/lib/api/errors";
import { useProject } from "@/lib/api/hooks";
import type { Project } from "@/lib/domain/project";
import {
  canEnterStep,
  getSteps,
  STEP_KEYS,
  type StepKey,
  type StepState,
} from "@/lib/domain/steps";
import { routes } from "@/lib/routes";

import { ProjectProvider } from "./project-context";
import { UploadSummaryPopover } from "./upload-summary";
import { ProjectTitle } from "./project-title";

function asStep(segment: string | null): StepKey | null {
  return STEP_KEYS.includes(segment as StepKey) ? (segment as StepKey) : null;
}

const WARN_HINTS: Partial<Record<StepState["status"], string>> = {
  stale: "완료한 뒤 내용이 바뀌었어요",
  attention: "초안을 만든 뒤 바뀌었어요",
};

/**
 * The bar shows the whole journey, and the domain already knows the state
 * of each stop: which are open, and which were finished before something
 * upstream moved under them. Both are handed over rather than recomputed.
 */
function buildSteps(project: Project) {
  return getSteps(project).map((step) => {
    const hint = WARN_HINTS[step.status];
    const upload = step.key === "upload";
    return {
      id: step.key,
      label: step.label,
      /* 올리기 is never locked and never navigates: it happened on /new,
         before this project existed. It opens its own summary instead. */
      locked: !upload && !step.enterable,
      warn: hint !== undefined,
      hint,
      wrap: upload
        ? (item: ReactNode) => (
            <UploadSummaryPopover project={project}>
              {item}
            </UploadSummaryPopover>
          )
        : step.enterable
          ? undefined
          : (item: ReactNode) => (
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  {item}
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  초안을 만든 뒤에 열 수 있어요
                </TooltipContent>
              </Tooltip>
            ),
    };
  });
}

export function ProjectShell({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const project = useProject(projectId);
  const currentStep = asStep(useSelectedLayoutSegment());
  const [actionsTarget, setActionsTarget] = useState<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  if (project.isPending) return <ShellSkeleton />;

  if (project.isError) {
    const missing =
      project.error instanceof ApiError && project.error.code === "not-found";
    return (
      <div className="app-wash flex min-h-svh flex-col bg-background">
        <header
          data-slot="app-bar"
          className="flex h-14 items-center border-b border-hairline px-4"
        >
          <BrandLink />
        </header>
        <ErrorState
          title={missing ? "자료를 찾을 수 없어요" : "자료를 불러오지 못했어요"}
          error={project.error}
          onRetry={missing ? undefined : () => project.refetch()}
        />
      </div>
    );
  }

  const locked =
    currentStep !== null && !canEnterStep(project.data, currentStep);

  return (
    <ProjectProvider project={project.data} actionsTarget={actionsTarget}>
      <div className="app-wash flex h-svh flex-col overflow-hidden bg-background">
        {/*
          The same bar and the same panel as every screen outside a project,
          so stepping into one does not change the furniture. The panel
          starts as a rail: the authoring screens are laid out for 1280px
          and 64px is what they can spare without being asked.
        */}
        <header
          data-slot="app-bar"
          className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-hairline px-3"
        >
          <Button
            variant="ghost"
            size="icon-sm"
            aria-expanded={!collapsed}
            aria-controls="project-sidebar"
            aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
            className="shrink-0 text-muted-foreground focus-visible:border-transparent focus-visible:ring-0 aria-expanded:bg-transparent"
            onClick={() => setCollapsed((value) => !value)}
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
          </Button>
          <BrandLink compact />
          <div className="flex max-w-56 min-w-0 flex-1 xl:max-w-72">
            <ProjectTitle project={project.data} />
          </div>
          <div className="mx-auto flex min-w-0 justify-center">
            <StepBar
              steps={buildSteps(project.data)}
              current={currentStep ?? "upload"}
              /* Finished steps go back to their screen. 올리기 has no screen
                 of its own — it happened on /new, before this project
                 existed — so it is the one that answers nothing. */
              onStepClick={(id) => {
                const step = id as StepKey;
                if (step === "upload") return;
                router.push(routes.step(projectId, step));
              }}
            />
          </div>
          <div ref={setActionsTarget} className="flex items-center gap-2" />
          <ThemeToggle />
        </header>
        <div className="flex min-h-0 flex-1">
          <AppSidebar
            id="project-sidebar"
            collapsed={collapsed}
            className="h-full"
          />
          {/*
            `min-w-0` matters here: as a flex item beside the panel, this
            column's floor is its min-content width by default, so a wide
            screen inside it pushes the whole shell sideways instead of
            scrolling within itself — the bar above ends up cut too.
          */}
          <div className="relative min-h-0 min-w-0 flex-1">
            {locked ? <LockedStep project={project.data} /> : children}
            <NarrowScreenNotice />
          </div>
        </div>
      </div>
    </ProjectProvider>
  );
}

function LockedStep({ project }: { project: Project }) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={LegalDocument01Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>아직 초안이 없어요</EmptyTitle>
        <EmptyDescription>
          사건 구조를 원문과 비교해 확인하고 초안을 만들면 이 단계를 열 수
          있어요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          nativeButton={false}
          render={<Link href={routes.step(project.id, "structure")} />}
        >
          사건 구조 확인으로
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/** The authoring screens need at least 1024px; say so instead of breaking. */
function NarrowScreenNotice() {
  return (
    <div className="absolute inset-0 z-40 flex bg-background/95 lg:hidden">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>넓은 화면에서 편집해 주세요</EmptyTitle>
          <EmptyDescription>
            원문과 쉬운 자료를 나란히 보려면 가로 1024px 이상의 화면이 필요해요.
            완성된 자료는 휴대폰에서도 읽을 수 있어요.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="secondary"
            nativeButton={false}
            render={<Link href={routes.materials()} />}
          >
            작업함으로
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div
      className="app-wash flex h-svh flex-col bg-background"
      aria-busy="true"
    >
      <div
        data-slot="app-bar"
        className="flex h-14 items-center gap-3 border-b border-hairline px-3"
      >
        <Skeleton className="size-8 rounded-[10px]" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mx-auto h-6 w-96 rounded-full" />
      </div>
      <div className="flex min-h-0 flex-1">
        {/* The rail is the shape the loaded screen settles into. */}
        <div className="w-16 shrink-0 border-r border-hairline" />
        <div className="flex flex-1 gap-4 p-4">
          <Skeleton className="h-full flex-1 rounded-xl" />
          <Skeleton className="h-full flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
