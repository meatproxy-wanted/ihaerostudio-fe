"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
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
import { useSearchParamsSync } from "@/hooks/use-search-params-sync";
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
import {
  countByStatus,
  type ReviewCategory,
  type ReviewItem,
  type ReviewRun,
} from "@/lib/domain/review";
import type { SourceDocument } from "@/lib/domain/source";
import { getReviewStatus } from "@/lib/domain/steps";
import { routes } from "@/lib/routes";
import { shouldIgnoreShortcut } from "@/lib/shortcuts";

import { FinishReviewDialog } from "./finish-review-dialog";
import { ReviewDetail } from "./review-detail";
import { ReviewList } from "./review-list";
import {
  groupItems,
  isHandled,
  parseReviewParams,
  visibleItems,
  type ReviewFilter,
} from "./review-model";

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
  const [initial] = useState(() => parseReviewParams(searchParams));
  const [filter, setFilter] = useState<ReviewFilter>(initial.filter);
  const [category, setCategory] = useState<ReviewCategory | null>(
    initial.category,
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
    onError: (error) => {
      toast.add({
        title: "점검하지 못했어요",
        description: errorMessage(error),
        type: "error",
        actionProps: {
          children: "다시 시도",
          onClick: () => {
            check.mutate();
          },
        },
      });
    },
  });
  const dismiss = useMutation({
    mutationFn: (input: { key: string; memo: string }) =>
      api.review.dismiss(project.id, input),
    onSuccess: storeRun,
    onError: (error, input) => {
      toast.add({
        title: "문제없음 확인을 저장하지 못했어요",
        description: errorMessage(error),
        type: "error",
        actionProps: {
          children: "다시 시도",
          onClick: () => {
            dismiss.mutate(input);
          },
        },
      });
    },
  });
  const restore = useMutation({
    mutationFn: (key: string) => api.review.restore(project.id, { key }),
    onSuccess: storeRun,
    onError: (error, key) => {
      toast.add({
        title: "확인을 취소하지 못했어요",
        description: errorMessage(error),
        type: "error",
        actionProps: {
          children: "다시 시도",
          onClick: () => {
            restore.mutate(key);
          },
        },
      });
    },
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
      queryClient.setQueryData(queryKeys.document(project.id), result.document);
      cacheProject(queryClient, result.project);
      toast.add({
        title: "수정안을 적용했어요",
        description: "문장이 바뀌어서 다시 점검할게요.",
        type: "success",
      });
      check.mutate();
    },
    onError: (error, item) => {
      toast.add({
        title: "수정안을 적용하지 못했어요",
        description: errorMessage(error),
        type: "error",
        actionProps: {
          children: "다시 시도",
          onClick: () => {
            applyFix.mutate(item);
          },
        },
      });
    },
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
  // The order the list shows: grouped, required before suggested.
  const shown = groupItems(visibleItems(items, filter, category)).flatMap(
    (entry) => entry.items,
  );
  const selected =
    items.find((item) => item.key === selectedKey) ?? shown[0] ?? null;

  useSearchParamsSync({
    show: filter,
    category,
    item: selected?.key ?? null,
  });

  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (shouldIgnoreShortcut(event) || event.metaKey || event.ctrlKey) return;
    if (event.key !== "j" && event.key !== "k") return;
    const index = shown.findIndex((item) => item.key === selected?.key);
    const next = shown[index + (event.key === "j" ? 1 : -1)];
    if (next) {
      event.preventDefault();
      setSelectedKey(next.key);
    }
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => onShortcut(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  /** After handling an item, move on to the next open one in list order. */
  function selectNextOpen(after: ReviewItem) {
    const index = shown.findIndex((item) => item.key === after.key);
    const rest = [
      ...shown.slice(index + 1),
      ...shown.slice(0, Math.max(index, 0)),
    ];
    setSelectedKey(rest.find((item) => !isHandled(item))?.key ?? null);
  }

  const counts = countByStatus(items);
  const progress = verificationProgress(document);
  const firstUnverified = allSentences(document).find((s) => !s.verified);
  const busy =
    check.isPending ||
    dismiss.isPending ||
    restore.isPending ||
    applyFix.isPending;
  const reviewStatus = getReviewStatus(project);

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
        {reviewStatus === "completed" ? (
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={routes.step(project.id, "export")} />}
          >
            내보내기로
          </Button>
        ) : (
          <FinishReviewDialog
            project={project}
            document={document}
            run={run}
            onRecheck={() => check.mutate()}
            checking={check.isPending}
          />
        )}
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
          {reviewStatus === "completed" && (
            <Badge variant="success" size="lg">
              검토 완료
            </Badge>
          )}
          {reviewStatus === "stale" && (
            <Badge variant="warning" size="lg">
              검토 후 수정됨 · 다시 마쳐 주세요
            </Badge>
          )}
          <Badge variant="warning" size="lg">
            확인 필요 남음 {counts.required}
          </Badge>
          <Badge variant="negative" size="lg">
            살펴보기 {counts.suggested}
          </Badge>
          <Badge variant="secondary" size="lg">
            처리함 {counts.handled}
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
                category={category}
                onCategory={(next) => {
                  setCategory(next);
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
