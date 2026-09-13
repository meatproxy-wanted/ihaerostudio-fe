"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { ko } from "date-fns/locale";
import { useDefaultLayout } from "react-resizable-panels";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";

import { ErrorState } from "@/components/app/error-state";
import { PanesSkeleton } from "@/components/app/panes-skeleton";
import {
  ShellActions,
  useCurrentProject,
} from "@/components/project-shell/project-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import {
  cacheProject,
  useDocumentQuery,
  useReviewRun,
  useSource,
} from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import {
  allSentences,
  applySuggestion,
  verificationProgress,
} from "@/lib/domain/document-ops";
import type { EasyDocument } from "@/lib/domain/document";
import type { Project } from "@/lib/domain/project";
import type { ReviewItem, ReviewRun } from "@/lib/domain/review";
import type { SourceDocument } from "@/lib/domain/source";
import { routes } from "@/lib/routes";

import { ReviewDetail } from "./review-detail";
import { ReviewList } from "./review-list";
import { isHandled, visibleItems, type ReviewFilter } from "./review-model";

export function ReviewScreen() {
  const project = useCurrentProject();
  const source = useSource(project.id);
  const document = useDocumentQuery(project.id);
  const review = useReviewRun(project.id);

  if (source.isPending || document.isPending || review.isPending) {
    return <PanesSkeleton />;
  }
  const error = source.error ?? document.error ?? review.error;
  if (error || !source.data || !document.data) {
    return (
      <ErrorState
        title="검토 화면을 불러오지 못했어요"
        error={error}
        onRetry={() => {
          void source.refetch();
          void document.refetch();
          void review.refetch();
        }}
      />
    );
  }

  return (
    <ReviewWorkspace
      project={project}
      source={source.data}
      document={document.data}
      run={review.data ?? null}
    />
  );
}

function ReviewWorkspace({
  project,
  source,
  document,
  run,
}: {
  project: Project;
  source: SourceDocument;
  document: EasyDocument;
  run: ReviewRun | null;
}) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<ReviewFilter>(
    (searchParams.get("show") as ReviewFilter | null) ?? "open",
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    searchParams.get("item"),
  );
  const layout = useDefaultLayout({
    id: "review-panes",
    panelIds: ["list", "detail"],
  });

  const storeRun = (result: { run: ReviewRun; project: Project }) => {
    cacheProject(queryClient, result.project);
    queryClient.setQueryData(queryKeys.review(project.id), result.run);
  };

  const check = useMutation({
    mutationFn: () => api.review.run(project.id),
    onSuccess: storeRun,
    onError: (error) =>
      toast.add({
        title: "점검하지 못했어요",
        description: errorMessage(error),
        type: "error",
      }),
  });
  const dismiss = useMutation({
    mutationFn: (input: { key: string; memo: string }) =>
      api.review.dismiss(project.id, input),
    onSuccess: storeRun,
  });
  const restore = useMutation({
    mutationFn: (key: string) => api.review.restore(project.id, { key }),
    onSuccess: storeRun,
  });
  const applyFix = useMutation({
    mutationFn: async (item: ReviewItem) => {
      if (item.target.type !== "sentence" || !item.suggestion) return null;
      const next = applySuggestion(
        document,
        item.target.sentenceId,
        item.suggestion.text,
      );
      return api.document.save(project.id, next);
    },
    onSuccess: (result) => {
      if (!result) return;
      cacheProject(queryClient, result.project);
      queryClient.setQueryData(queryKeys.document(project.id), result.document);
      toast.add({
        title: "수정안을 적용했어요",
        description: "문장이 바뀌어서 다시 점검할게요.",
        type: "success",
      });
      check.mutate();
    },
    onError: (error) =>
      toast.add({
        title: "수정안을 적용하지 못했어요",
        description: errorMessage(error),
        type: "error",
      }),
  });

  // Check again on arrival when the content moved since the last check.
  const autoChecked = useRef(false);
  const needsCheck =
    project.document !== null &&
    project.review.checkedContentRevision !== project.document.contentRevision;
  useEffect(() => {
    if (!needsCheck || autoChecked.current) return;
    autoChecked.current = true;
    check.mutate();
  }, [needsCheck, check]);

  const items = run?.items ?? [];
  const shown = visibleItems(items, filter);
  const selected =
    items.find((item) => item.key === selectedKey) ?? shown[0] ?? null;

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("show", filter);
    if (selected) url.searchParams.set("item", selected.key);
    else url.searchParams.delete("item");
    window.history.replaceState(null, "", url);
  }, [filter, selected]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        !target ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.closest("[role=dialog]")
      ) {
        return;
      }
      if (event.key !== "j" && event.key !== "k") return;
      const index = shown.findIndex((item) => item.key === selected?.key);
      const next = shown[index + (event.key === "j" ? 1 : -1)];
      if (next) {
        event.preventDefault();
        setSelectedKey(next.key);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shown, selected]);

  function selectNextOpen(after: ReviewItem) {
    const open = items.filter(
      (item) => !isHandled(item) && item.key !== after.key,
    );
    setSelectedKey(open[0]?.key ?? null);
  }

  const required = items.filter((i) => i.level === "required" && !isHandled(i));
  const suggested = items.filter(
    (i) => i.level === "suggested" && !isHandled(i),
  );
  const handled = items.filter(isHandled);
  const progress = verificationProgress(document);
  const firstUnverified = allSentences(document).find((s) => !s.verified);
  const busy =
    check.isPending ||
    dismiss.isPending ||
    restore.isPending ||
    applyFix.isPending;

  return (
    <div className="flex h-full flex-col">
      <ShellActions>
        <Button
          size="sm"
          variant="secondary"
          disabled={check.isPending}
          onClick={() => check.mutate()}
        >
          {check.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <HugeiconsIcon
              icon={RefreshIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          )}
          다시 점검
        </Button>
      </ShellActions>

      <div className="flex shrink-0 flex-col gap-3 border-b border-hairline px-6 py-4">
        <p className="flex items-start gap-2 text-2sm text-muted-foreground">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2}
            size={16}
            className="mt-0.5 shrink-0 text-info"
          />
          자동 점검은 놓치기 쉬운 부분을 찾도록 돕는 기능이에요. 정확성을
          보장하지 않으니, 최종 확인은 직접 해 주세요.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-2 text-lg font-bold tracking-tight">검토하기</h2>
          <Badge variant="warning" size="lg">
            확인 필요 남음 {required.length}
          </Badge>
          <Badge variant="negative" size="lg">
            살펴보기 {suggested.length}
          </Badge>
          <Badge variant="secondary" size="lg">
            처리함 {handled.length}
          </Badge>
          <span className="mx-1 h-4 w-px bg-border" />
          <span className="text-2sm font-semibold tabular-nums">
            원문 대조 {progress.verified}/{progress.total}
          </span>
          {firstUnverified && (
            <Button
              size="xs"
              variant="ghost"
              nativeButton={false}
              render={
                <Link
                  href={routes.editor(project.id, {
                    sentence: firstUnverified.id,
                    fromReview: true,
                  })}
                />
              }
            >
              대조하러 가기
            </Button>
          )}
          <span
            className="ml-auto text-2sm text-muted-foreground"
            aria-live="polite"
          >
            {check.isPending
              ? "점검하고 있어요…"
              : run
                ? `${formatDistanceToNowStrict(new Date(run.ranAt), { addSuffix: true, locale: ko })} 점검`
                : "아직 점검하지 않았어요"}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {!run ? (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyTitle>
                {check.isPending
                  ? "점검하고 있어요"
                  : "아직 점검 결과가 없어요"}
              </EmptyTitle>
              <EmptyDescription>
                문서를 원문, 사건 구조와 비교해 확인할 항목을 찾아요.
              </EmptyDescription>
            </EmptyHeader>
            {check.isPending && <Spinner />}
          </Empty>
        ) : (
          <ResizablePanelGroup
            orientation="horizontal"
            defaultLayout={layout.defaultLayout}
            onLayoutChanged={layout.onLayoutChanged}
          >
            <ResizablePanel id="list" defaultSize="38" minSize="26">
              <ReviewList
                items={shown}
                allItems={items}
                filter={filter}
                onFilter={(next) => {
                  setFilter(next);
                  setSelectedKey(null);
                }}
                selectedKey={selected?.key ?? null}
                onSelect={setSelectedKey}
                checking={check.isPending}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="detail" defaultSize="62" minSize="40">
              <div className="h-full overflow-y-auto">
                {selected ? (
                  <ReviewDetail
                    key={selected.key}
                    projectId={project.id}
                    item={selected}
                    document={document}
                    source={source}
                    busy={busy}
                    onApplySuggestion={(item) => applyFix.mutate(item)}
                    onDismiss={(item, memo) =>
                      dismiss.mutate(
                        { key: item.key, memo },
                        { onSuccess: () => selectNextOpen(item) },
                      )
                    }
                    onRestore={(item) => restore.mutate(item.key)}
                  />
                ) : (
                  <Empty className="h-full">
                    <EmptyHeader>
                      <EmptyTitle>
                        {items.length === 0
                          ? "찾은 문제가 없어요"
                          : "남은 항목이 없어요"}
                      </EmptyTitle>
                      <EmptyDescription>
                        그래도 최종 확인 체크리스트로 직접 확인해 주세요.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
