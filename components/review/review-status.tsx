"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

import {
  REVIEW_STATUS_LABELS,
  type ReviewItemStatus,
} from "@/lib/domain/review";
import { cn } from "@/lib/utils";

/** One look per status, shared by the review list, detail, and editor. */
export const REVIEW_STATUS_STYLES: Record<
  ReviewItemStatus,
  {
    icon: typeof Alert02Icon;
    tone: string;
    badge: "warning" | "negative" | "outline";
  }
> = {
  required: { icon: Alert02Icon, tone: "text-warning", badge: "warning" },
  suggested: {
    icon: InformationCircleIcon,
    tone: "text-info",
    badge: "negative",
  },
  handled: {
    icon: CheckmarkCircle02Icon,
    tone: "text-muted-foreground",
    badge: "outline",
  },
};

/** The status icon with its label for screen readers (never color alone). */
export function ReviewStatusIcon({
  status,
  className,
}: {
  status: ReviewItemStatus;
  className?: string;
}) {
  const style = REVIEW_STATUS_STYLES[status];
  return (
    <>
      <HugeiconsIcon
        icon={style.icon}
        strokeWidth={2}
        size={17}
        aria-hidden="true"
        className={cn("shrink-0", style.tone, className)}
      />
      <span className="sr-only">({REVIEW_STATUS_LABELS[status]})</span>
    </>
  );
}
