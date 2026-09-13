"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ILLUSTRATIONS_LABELS,
  NAMING_LABELS,
  TONE_LABELS,
} from "@/lib/domain/common";
import type { Project } from "@/lib/domain/project";
import { getSteps, type StepKey, type StepState } from "@/lib/domain/steps";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const STATUS_HINTS: Partial<Record<StepState["status"], string>> = {
  done: "완료",
  stale: "완료한 뒤 내용이 바뀌었어요",
  attention: "초안을 만든 뒤 바뀌었어요",
};

function StepMarker({ step, current }: { step: StepState; current: boolean }) {
  const { status } = step;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
        current
          ? "bg-primary text-primary-foreground"
          : status === "done"
            ? "bg-success text-white"
            : status === "stale" || status === "attention"
              ? "bg-warning/15 text-warning"
              : "text-muted-foreground ring-1 ring-border",
      )}
    >
      {status === "done" && !current ? (
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={3} size={12} />
      ) : status === "stale" || status === "attention" ? (
        "!"
      ) : (
        step.number
      )}
    </span>
  );
}

const itemClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-2sm font-medium whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/25";

function StepLabel({ step, current }: { step: StepState; current: boolean }) {
  const hint = STATUS_HINTS[step.status];
  return (
    <>
      <StepMarker step={step} current={current} />
      <span className={cn(!current && "hidden xl:inline")}>{step.label}</span>
      {hint && <span className="sr-only">({hint})</span>}
    </>
  );
}

function UploadSummary({ project }: { project: Project }) {
  const step = getSteps(project)[0];
  const { source, settings } = project;
  return (
    <Popover>
      <PopoverTrigger
        className={cn(itemClassName, "text-muted-foreground hover:bg-accent")}
      >
        <StepLabel step={step} current={false} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="flex flex-col gap-1">
          <p className="text-2sm font-semibold text-muted-foreground">
            올린 판결문
          </p>
          <p className="font-semibold">
            {source.kind === "pdf"
              ? (source.fileName ?? "PDF 파일")
              : "붙여 넣은 텍스트"}
          </p>
          <p className="text-2sm text-muted-foreground">
            {source.charCount.toLocaleString("ko-KR")}자
          </p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-2sm">
          <dt className="text-muted-foreground">문체</dt>
          <dd className="font-medium">{TONE_LABELS[settings.tone]}</dd>
          <dt className="text-muted-foreground">인물 호칭</dt>
          <dd className="font-medium">{NAMING_LABELS[settings.naming]}</dd>
          <dt className="text-muted-foreground">그림</dt>
          <dd className="font-medium">
            {ILLUSTRATIONS_LABELS[settings.illustrations]}
          </dd>
        </dl>
        <p className="text-2sm text-muted-foreground">
          설정은 사건 구조 단계의 [자료 설정]에서 바꿀 수 있어요.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export function StepBar({
  project,
  current,
}: {
  project: Project;
  current: StepKey | null;
}) {
  const steps = getSteps(project);

  return (
    <nav aria-label="제작 단계">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCurrent = step.key === current;
          return (
            <li key={step.key} className="flex items-center">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="mx-0.5 h-px w-2 bg-border xl:w-3"
                />
              )}
              {step.key === "upload" ? (
                <UploadSummary project={project} />
              ) : step.enterable ? (
                <Link
                  href={routes.step(project.id, step.key)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    itemClassName,
                    isCurrent
                      ? "bg-accent font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <StepLabel step={step} current={isCurrent} />
                </Link>
              ) : (
                <Tooltip>
                  <TooltipTrigger
                    render={<span />}
                    aria-disabled="true"
                    className={cn(
                      itemClassName,
                      "cursor-not-allowed text-muted-foreground opacity-50",
                    )}
                  >
                    <StepLabel step={step} current={false} />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    초안을 만든 뒤에 열 수 있어요
                  </TooltipContent>
                </Tooltip>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
