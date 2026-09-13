"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { ko } from "date-fns/locale";
import { HugeiconsIcon } from "@hugeicons/react";

import { useCurrentProject } from "@/components/project-shell/project-context";
import {
  REVIEW_STATUS_STYLES,
  ReviewStatusIcon,
} from "@/components/review/review-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewRun } from "@/lib/api/hooks";
import {
  countByStatus,
  REVIEW_CATEGORY_LABELS,
  reviewItemStatus,
  type ReviewItemStatus,
} from "@/lib/domain/review";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { PanelSection } from "./panel-section";

const SUMMARY_LABELS: Record<ReviewItemStatus, string> = {
  required: "확인 필요",
  suggested: "살펴보기",
  handled: "처리함",
};

/** What the last check found, for the tool panel when nothing is selected. */
export function LastCheckSummary() {
  const project = useCurrentProject();
  const review = useReviewRun(project.id);
  const run = review.data;
  const counts = run ? countByStatus(run.items) : null;

  return (
    <PanelSection title="마지막 점검">
      {review.isPending ? (
        <Skeleton className="h-16 w-full" />
      ) : !run || !counts ? (
        <p className="text-2sm text-muted-foreground">
          {review.isError
            ? "점검 결과를 불러오지 못했어요."
            : "아직 점검하지 않았어요. 검토하기에 들어가면 점검해요."}
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-1.5">
            {(["required", "suggested", "handled"] as const).map((status) => (
              <div
                key={status}
                className="flex flex-col gap-0.5 rounded-lg bg-secondary px-2.5 py-2"
              >
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <HugeiconsIcon
                    icon={REVIEW_STATUS_STYLES[status].icon}
                    strokeWidth={2}
                    size={13}
                    aria-hidden="true"
                    className={REVIEW_STATUS_STYLES[status].tone}
                  />
                  {SUMMARY_LABELS[status]}
                </dt>
                <dd className="text-lg font-bold tabular-nums">
                  {counts[status]}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-2sm text-muted-foreground">
            {formatDistanceToNowStrict(new Date(run.ranAt), {
              addSuffix: true,
              locale: ko,
            })}{" "}
            점검
            {project.document &&
              project.review.checkedContentRevision !==
                project.document.contentRevision &&
              " · 점검 뒤 문서가 바뀌었어요"}
          </p>
        </>
      )}
      <Button
        variant="weak"
        size="xs"
        className="self-start"
        nativeButton={false}
        render={<Link href={routes.review(project.id)} />}
      >
        검토하기에서 보기
      </Button>
    </PanelSection>
  );
}

/**
 * The last check's items about one sentence. An item is marked when the
 * sentence has changed since it was checked, since it may no longer apply.
 */
export function SentenceCheckItems({
  sentenceId,
  text,
}: {
  sentenceId: string;
  text: string;
}) {
  const project = useCurrentProject();
  const review = useReviewRun(project.id);
  const items = (review.data?.items ?? []).filter(
    (item) =>
      item.target.type === "sentence" && item.target.sentenceId === sentenceId,
  );

  return (
    <PanelSection
      title={
        review.data
          ? `이 문장의 점검 항목 ${items.length}`
          : "이 문장의 점검 항목"
      }
    >
      {review.isPending ? (
        <Skeleton className="h-10 w-full" />
      ) : !review.data ? (
        <p className="text-2sm text-muted-foreground">
          아직 점검하지 않았어요.
        </p>
      ) : items.length === 0 ? (
        <p className="text-2sm text-muted-foreground">
          마지막 점검에서 이 문장에 대한 항목은 없었어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => {
            const status = reviewItemStatus(item);
            const changed =
              item.evidence.text !== null && item.evidence.text !== text;
            return (
              <li key={item.key}>
                <Link
                  href={routes.review(project.id, { item: item.key })}
                  className={cn(
                    "flex items-start gap-2 rounded-lg px-2.5 py-2 text-2sm ring-1 ring-hairline hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                    status === "handled" && "opacity-70",
                  )}
                >
                  <ReviewStatusIcon status={status} className="mt-0.5" />
                  <span className="flex min-w-0 flex-col items-start gap-1">
                    <span className="leading-snug font-semibold">
                      {item.title}
                    </span>
                    <span className="text-muted-foreground">
                      {REVIEW_CATEGORY_LABELS[item.category]}
                    </span>
                    {changed && (
                      <Badge variant="secondary">점검 뒤 바뀐 문장이에요</Badge>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PanelSection>
  );
}
