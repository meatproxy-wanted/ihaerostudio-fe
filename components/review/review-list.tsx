"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

import {
  REVIEW_CATEGORY_LABELS,
  REVIEW_GROUP_LABELS,
  type ReviewItem,
} from "@/lib/domain/review";
import { cn } from "@/lib/utils";

import { groupItems, isHandled, type ReviewFilter } from "./review-model";

const FILTERS: { key: ReviewFilter; label: string }[] = [
  { key: "open", label: "남은 항목" },
  { key: "done", label: "처리한 항목" },
  { key: "all", label: "전체" },
];

export function ReviewList({
  items,
  allItems,
  filter,
  onFilter,
  selectedKey,
  onSelect,
  checking,
}: {
  items: ReviewItem[];
  allItems: ReviewItem[];
  filter: ReviewFilter;
  onFilter: (filter: ReviewFilter) => void;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  checking: boolean;
}) {
  const counts: Record<ReviewFilter, number> = {
    open: allItems.filter((item) => !isHandled(item)).length,
    done: allItems.filter(isHandled).length,
    all: allItems.length,
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        role="tablist"
        aria-label="점검 항목 거르기"
        className="flex shrink-0 gap-1 border-b border-hairline px-4 py-2.5"
      >
        {FILTERS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={filter === entry.key}
            onClick={() => onFilter(entry.key)}
            className={cn(
              "h-8 rounded-full px-3 text-2sm font-medium",
              filter === entry.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {entry.label} {counts[entry.key]}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-3 py-3 transition-opacity",
          checking && "opacity-50",
        )}
        aria-busy={checking}
      >
        {items.length === 0 ? (
          <p className="px-2 py-8 text-center text-2sm text-muted-foreground">
            {filter === "open"
              ? "남은 항목이 없어요."
              : filter === "done"
                ? "아직 처리한 항목이 없어요."
                : "찾은 항목이 없어요."}
          </p>
        ) : (
          groupItems(items).map(({ group, items: groupItemsList }) => (
            <section key={group} className="mb-4">
              <h3 className="px-2 pb-1.5 text-2sm font-bold text-muted-foreground">
                {REVIEW_GROUP_LABELS[group]}
              </h3>
              <ul className="flex flex-col gap-1">
                {groupItemsList.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      aria-current={selectedKey === item.key || undefined}
                      onClick={() => onSelect(item.key)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                        selectedKey === item.key &&
                          "bg-accent ring-1 ring-border",
                        isHandled(item) && "opacity-60",
                      )}
                    >
                      <HugeiconsIcon
                        icon={
                          isHandled(item)
                            ? CheckmarkCircle02Icon
                            : item.level === "required"
                              ? Alert02Icon
                              : InformationCircleIcon
                        }
                        strokeWidth={2}
                        size={17}
                        className={cn(
                          "mt-0.5 shrink-0",
                          isHandled(item)
                            ? "text-muted-foreground"
                            : item.level === "required"
                              ? "text-warning"
                              : "text-info",
                        )}
                      />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm leading-snug font-semibold">
                          {item.title}
                        </span>
                        <span className="truncate text-2sm text-muted-foreground">
                          {REVIEW_CATEGORY_LABELS[item.category]}
                          {item.evidence.text ? ` · ${item.evidence.text}` : ""}
                        </span>
                      </span>
                      <span className="sr-only">
                        {isHandled(item)
                          ? "(문제없음 확인)"
                          : item.level === "required"
                            ? "(확인 필요)"
                            : "(살펴보기)"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
