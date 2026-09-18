"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import {
  IMAGE_JOB_MODES,
  imageJobStatus,
  type ImageJobDetail,
} from "@/lib/api/image-jobs";
import { cn } from "@/lib/utils";

export function PromptViewer({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="secondary" size="sm" />}>
        프롬프트 보기
      </DialogTrigger>
      <DialogContent className="flex max-h-[85svh] flex-col overflow-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>그림 생성 프롬프트</DialogTitle>
          <DialogDescription>
            워크플로우에 저장된 실제 입력이에요. 조회만 하며 그림을 다시 만들지
            않아요. 개인정보가 포함될 수 있으니 공유에 주의해 주세요.
          </DialogDescription>
        </DialogHeader>
        {open && <PromptViewerContent projectId={projectId} />}
      </DialogContent>
    </Dialog>
  );
}

function PromptViewerContent({ projectId }: { projectId: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const list = useInfiniteQuery({
    queryKey: ["studio-image-jobs", projectId],
    queryFn: ({ pageParam, signal }) =>
      api.imageJobs.list(
        projectId,
        { offset: pageParam, limit: 20 },
        { signal },
      ),
    initialPageParam: 0,
    getNextPageParam: (page) => page.nextOffset ?? undefined,
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const jobs = list.data?.pages.flatMap((page) => page.jobs) ?? [];
  const jobId = selected ?? jobs[0]?.jobId;
  const detail = useQuery({
    queryKey: ["studio-image-job", projectId, jobId],
    queryFn: ({ signal }) => api.imageJobs.get(projectId, jobId!, { signal }),
    enabled: Boolean(jobId),
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-2sm">
        <span className="min-w-0 break-all text-muted-foreground">
          자료 ID: {projectId}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={list.isFetching || detail.isFetching}
          onClick={() => {
            void list.refetch();
            if (jobId) void detail.refetch();
          }}
        >
          새로고침
        </Button>
      </div>
      {list.isPending && <p role="status">생성 잡을 불러오고 있어요.</p>}
      {list.error && (
        <p role="alert" className="text-destructive">
          {errorMessage(list.error)}
        </p>
      )}
      {!list.isPending && !list.error && jobs.length === 0 && (
        <p className="py-6 text-muted-foreground">
          저장된 그림 생성 잡이 없어요. 그림 생성 이후에 확인해 주세요.
        </p>
      )}
      {jobs.length > 0 && (
        <div className="grid min-h-0 gap-4 overflow-y-auto sm:grid-cols-[220px_minmax(0,1fr)]">
          <div
            className="flex flex-col gap-2 sm:max-h-[60svh] sm:overflow-y-auto"
            aria-label="그림 생성 잡 목록"
          >
            {jobs.map((job, index) => (
              <button
                key={job.jobId}
                type="button"
                aria-pressed={jobId === job.jobId}
                onClick={() => setSelected(job.jobId)}
                className={cn(
                  "rounded-lg border p-3 text-left text-2sm transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary",
                  jobId === job.jobId
                    ? "border-primary bg-secondary"
                    : "border-border",
                )}
              >
                <span className="block font-semibold">
                  {IMAGE_JOB_MODES[job.mode]} · {imageJobStatus(job.status)}
                </span>
                <span className="mt-1 block text-xs break-all text-muted-foreground">
                  {job.jobId}
                </span>
                {index === 0 && (
                  <span className="mt-1 block text-xs">가장 최근 잡</span>
                )}
              </button>
            ))}
            {list.hasNextPage && (
              <Button
                variant="secondary"
                size="sm"
                disabled={list.isFetchingNextPage}
                onClick={() => void list.fetchNextPage()}
              >
                {list.isFetchingNextPage ? "불러오는 중…" : "이전 잡 더 보기"}
              </Button>
            )}
          </div>
          <div className="min-w-0 space-y-4 sm:max-h-[60svh] sm:overflow-y-auto sm:pr-2">
            {detail.isPending && (
              <p role="status">프롬프트를 불러오고 있어요.</p>
            )}
            {detail.error && (
              <p role="alert" className="text-destructive">
                {errorMessage(detail.error)}
              </p>
            )}
            {!detail.error && detail.data && <JobDetail job={detail.data} />}
          </div>
        </div>
      )}
    </div>
  );
}

function JobDetail({ job }: { job: ImageJobDetail }) {
  const submission = {
    "not-submitted": "아직 전송되지 않은 작업이에요.",
    uncertain:
      "접수 여부가 불확실한 작업이에요. 아래는 해당 시도에 저장된 입력이에요.",
    accepted:
      "제공자에 접수된 작업의 저장 입력이에요. 완료 여부는 잡 상태를 확인해 주세요.",
    "not-applicable":
      "고정 캐릭터를 적용한 작업으로 Comfy 생성은 하지 않았어요.",
  }[job.submissionState];
  return (
    <>
      <div className="space-y-1 text-2sm">
        <p className="font-semibold">
          {IMAGE_JOB_MODES[job.mode]} · {imageJobStatus(job.status)}
        </p>
        <p className="break-all text-muted-foreground">잡 ID: {job.jobId}</p>
        <p className="break-all text-muted-foreground">
          카드: {job.cardIds.join(", ") || "설계 전"}
        </p>
        <p>{submission}</p>
      </div>
      {!job.workflowAvailable && (
        <p className="rounded-lg bg-secondary p-3 text-2sm">
          {job.mode === "library"
            ? "고정 캐릭터 얼굴은 생성 프롬프트가 없어요."
            : "최종 워크플로우가 아직 준비되지 않았어요. LLM 설계가 있으면 아래에 표시해요."}
        </p>
      )}
      {job.prompts.map((prompt) => (
        <section key={prompt.nodeId} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {prompt.role === "positive"
                ? "최종 프롬프트"
                : prompt.role === "negative"
                  ? "네거티브 프롬프트"
                  : "기타 프롬프트"}{" "}
              · 노드 {prompt.nodeId}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              disabled={!prompt.text}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(prompt.text);
                  toast.add({
                    title: "프롬프트를 복사했어요",
                    type: "success",
                  });
                } catch {
                  toast.add({
                    title: "복사하지 못했어요",
                    description: "문구를 직접 선택해 복사해 주세요.",
                    type: "error",
                  });
                }
              }}
            >
              복사
            </Button>
          </div>
          <pre className="rounded-lg border bg-muted/30 p-3 font-mono text-xs [overflow-wrap:anywhere] whitespace-pre-wrap">
            {prompt.text || "(빈 입력)"}
          </pre>
        </section>
      ))}
      {job.references.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">실제 레퍼런스 입력</h3>
          {job.references.map((reference) => (
            <div
              key={reference.imageNumber}
              className="rounded-lg border p-3 text-xs [overflow-wrap:anywhere]"
            >
              <p className="font-semibold">
                Picture {reference.imageNumber} ·{" "}
                {reference.purpose === "character"
                  ? "등장인물"
                  : reference.purpose === "mood"
                    ? "분위기 샘플"
                    : "구형 잡 · 인물 연결 정보 없음"}
              </p>
              <p>
                인물 ID: {reference.partyId ?? "없음"} / 그림 ID:{" "}
                {reference.assetId ?? "없음"}
              </p>
              <p>파일: {reference.filename ?? "비공개 또는 없음"}</p>
            </div>
          ))}
        </section>
      )}
      {job.designs.map((design, index) => (
        <section key={`${design.cardId}:${index}`} className="space-y-2">
          <h3 className="text-sm font-semibold">
            LLM 설계 {index + 1} · {design.cardId}
          </h3>
          <p className="text-xs text-muted-foreground">
            컷별 설계 내용이며 위 최종 프롬프트와는 달라요.
          </p>
          <pre className="rounded-lg border p-3 font-mono text-xs [overflow-wrap:anywhere] whitespace-pre-wrap">
            {JSON.stringify(design, null, 2)}
          </pre>
        </section>
      ))}
      {job.settings.length > 0 && (
        <details className="rounded-lg border p-3">
          <summary className="cursor-pointer text-sm font-semibold">
            모델·스텝·CFG 등 워크플로우 설정
          </summary>
          <pre className="mt-3 font-mono text-xs [overflow-wrap:anywhere] whitespace-pre-wrap">
            {JSON.stringify(job.settings, null, 2)}
          </pre>
        </details>
      )}
    </>
  );
}
