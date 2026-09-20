"use client";

import type { ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ILLUSTRATIONS_LABELS,
  NAMING_LABELS,
  TONE_LABELS,
} from "@/lib/domain/common";
import type { Project } from "@/lib/domain/project";

/**
 * What the first step of the bar answers. 올리기 happened on /new, before
 * this project existed, so it has no screen to go back to — pressing it
 * shows what was uploaded and the settings it was read with instead.
 */
export function UploadSummaryPopover({
  project,
  children,
}: {
  project: Project;
  children: ReactNode;
}) {
  const { source, settings } = project;
  return (
    <Popover>
      {/*
        `inline-flex`, not `contents`: an element with `display: contents`
        generates no box, so the popover has nothing to measure and opens
        away from the step it belongs to.
      */}
      <PopoverTrigger render={<span className="inline-flex" />}>
        {children}
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
