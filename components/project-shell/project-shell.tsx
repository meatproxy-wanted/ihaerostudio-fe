"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon, LegalDocument01Icon } from "@hugeicons/core-free-icons";

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
import { ApiError } from "@/lib/api/errors";
import { useProject } from "@/lib/api/hooks";
import type { Project } from "@/lib/domain/project";
import { canEnterStep, STEP_KEYS, type StepKey } from "@/lib/domain/steps";
import { routes } from "@/lib/routes";

import { ProjectProvider } from "./project-context";
import { ProjectTitle } from "./project-title";
import { StepBar } from "./step-bar";

function asStep(segment: string | null): StepKey | null {
  return STEP_KEYS.includes(segment as StepKey) ? (segment as StepKey) : null;
}

export function ProjectShell({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const project = useProject(projectId);
  const currentStep = asStep(useSelectedLayoutSegment());
  const [actionsTarget, setActionsTarget] = useState<HTMLElement | null>(null);

  if (project.isPending) return <ShellSkeleton />;

  if (project.isError) {
    const missing =
      project.error instanceof ApiError && project.error.code === "not-found";
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <header className="flex h-14 items-center border-b border-hairline px-4">
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
      <div className="flex h-svh flex-col overflow-hidden bg-background">
        <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-hairline bg-background px-3">
          <BrandLink compact />
          <div className="flex max-w-56 min-w-0 flex-1 xl:max-w-72">
            <ProjectTitle project={project.data} />
          </div>
          <div className="mx-auto flex min-w-0 justify-center">
            <StepBar project={project.data} current={currentStep} />
          </div>
          <div ref={setActionsTarget} className="flex items-center gap-2" />
          <ThemeToggle />
        </header>
        <div className="relative min-h-0 flex-1">
          {locked ? <LockedStep project={project.data} /> : children}
          <NarrowScreenNotice />
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
            render={<Link href={routes.home()} />}
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
    <div className="flex h-svh flex-col bg-background" aria-busy="true">
      <div className="flex h-14 items-center gap-3 border-b border-hairline px-3">
        <Skeleton className="size-8 rounded-[10px]" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mx-auto h-6 w-96 rounded-full" />
      </div>
      <div className="flex flex-1 gap-4 p-4">
        <Skeleton className="h-full flex-1 rounded-xl" />
        <Skeleton className="h-full flex-1 rounded-xl" />
      </div>
    </div>
  );
}
