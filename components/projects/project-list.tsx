"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { ko } from "date-fns/locale";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  LegalDocument01Icon,
  MoreVerticalIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

import { ErrorState } from "@/components/app/error-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api/errors";
import {
  useProjects,
  useRemoveProject,
  useResetDemo,
  useServerMode,
} from "@/lib/api/hooks";
import type { Project } from "@/lib/domain/project";
import { getResumeStep, STEP_LABELS } from "@/lib/domain/steps";
import { routes } from "@/lib/routes";

import { PublicationBadge, ReviewStatusBadge } from "./status-badges";

export function ProjectList() {
  const projects = useProjects();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">작업함</h1>
          <p className="text-md text-muted-foreground">
            판결문을 원문과 대조하며 쉬운 설명자료로 다듬어요.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={routes.newProject()} />}
        >
          <HugeiconsIcon
            icon={Add01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          새 자료 만들기
        </Button>
      </div>

      <section aria-label="자료 목록" className="mt-8 flex flex-col">
        {projects.isPending ? (
          <ProjectListSkeleton />
        ) : projects.isError ? (
          <ErrorState
            title="작업함을 불러오지 못했어요"
            error={projects.error}
            onRetry={() => projects.refetch()}
          />
        ) : projects.data.length === 0 ? (
          <EmptyProjects />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {projects.data.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </ul>
        )}
      </section>

      <ResetDemoData />
    </main>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const removeProject = useRemoveProject();
  const resumeStep = getResumeStep(project);
  const updated = formatDistanceToNowStrict(new Date(project.updatedAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <li className="group/row relative rounded-xl bg-card ring-1 ring-hairline transition-shadow hover:ring-border">
      <Link
        href={routes.step(project.id, resumeStep)}
        className="flex items-center gap-4 rounded-xl p-4 pr-14 outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
      >
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-text"
        >
          <HugeiconsIcon
            icon={LegalDocument01Icon}
            strokeWidth={1.8}
            size={20}
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-md font-semibold">
            {project.title}
          </span>
          <span className="truncate text-2sm text-muted-foreground">
            {project.caseNumber ?? "사건번호 없음"} · {updated} 수정
          </span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <Badge variant="outline">지금 · {STEP_LABELS[resumeStep]}</Badge>
          <ReviewStatusBadge project={project} />
          <PublicationBadge project={project} />
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
              aria-label={`${project.title} 메뉴`}
            />
          }
        >
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{"이 자료를\n지울까요?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {`"${project.title}"의 사건 구조, 편집 내용, 게시본이 모두 사라져요. 되돌릴 수 없어요.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              disabled={removeProject.isPending}
              onClick={() =>
                removeProject.mutate(project.id, {
                  onSuccess: () => {
                    setConfirmingDelete(false);
                    toast.add({ title: "자료를 지웠어요", type: "success" });
                  },
                  onError: (error) =>
                    toast.add({
                      title: "지우지 못했어요",
                      description: errorMessage(error),
                      type: "error",
                    }),
                })
              }
            >
              지우기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

function ProjectListSkeleton() {
  return (
    <ul aria-hidden="true" className="flex flex-col gap-2.5">
      {[0, 1, 2].map((index) => (
        <li
          key={index}
          className="flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-hairline"
        >
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyProjects() {
  return (
    <Empty className="flex-none rounded-2xl bg-card py-16 ring-1 ring-hairline">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={LegalDocument01Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>아직 만든 자료가 없어요</EmptyTitle>
        <EmptyDescription>
          판결문을 올리면 AI가 사건 구조를 정리해요. 원문과 비교하며 쉬운
          설명자료로 완성해 보세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button
          nativeButton={false}
          render={<Link href={routes.newProject()} />}
        >
          새 자료 만들기
        </Button>
        <Button
          variant="secondary"
          nativeButton={false}
          render={<Link href={routes.newProject({ sample: true })} />}
        >
          <HugeiconsIcon
            icon={SparklesIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          샘플로 체험하기
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/** Clears this producer's projects. Shown only where the server allows it: demo mode outside production. */
function ResetDemoData() {
  const [open, setOpen] = useState(false);
  const resetDemo = useResetDemo();
  const { canReset } = useServerMode();

  if (!canReset) return null;

  return (
    <div className="mt-auto flex justify-center pt-10">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          데모 데이터 초기화
        </Button>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {"데모 데이터를\n모두 지울까요?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              서버에 저장된 내 자료가 모두 사라져요. 시연을 처음부터 다시 할 때
              쓰세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              disabled={resetDemo.isPending}
              onClick={() =>
                resetDemo.mutate(undefined, {
                  onSuccess: () => {
                    setOpen(false);
                    toast.add({
                      title: "데모 데이터를 지웠어요",
                      type: "success",
                    });
                  },
                  onError: (error) =>
                    toast.add({
                      title: "지우지 못했어요",
                      description: errorMessage(error),
                      type: "error",
                    }),
                })
              }
            >
              모두 지우기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
