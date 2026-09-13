"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  REVIEW_CATEGORY_LABELS,
  REVIEW_GROUP_LABELS,
  reviewItemStatus,
  type ReviewCategory,
  type ReviewItem,
} from "@/lib/domain/review";
import { cn } from "@/lib/utils";

import {
  categoryCounts,
  groupItems,
  visibleItems,
  type ReviewFilter,
} from "./review-model";
import { ReviewStatusIcon } from "./review-status";

const FILTERS: { key: ReviewFilter; label: string }[] = [
  { key: "open", label: "남은 항목" },
  { key: "done", label: "처리한 항목" },
  { key: "all", label: "전체" },
];

const EMPTY_MESSAGES: Record<ReviewFilter, string> = {
  open: "남은 항목이 없어요.",
  done: "아직 처리한 항목이 없어요.",
  all: "찾은 항목이 없어요.",
};

export function ReviewList({
  items,
  allItems,
  filter,
  onFilter,
  category,
  onCategory,
  selectedKey,
  onSelect,
  checking,
}: {
  items: ReviewItem[];
  allItems: ReviewItem[];
  filter: ReviewFilter;
  onFilter: (filter: ReviewFilter) => void;
  category: ReviewCategory | null;
  onCategory: (category: ReviewCategory | null) => void;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  checking: boolean;
}) {
  const categories = categoryCounts(visibleItems(allItems, filter));
  // Keep the chosen chip visible even when the other filter has none of it.
  if (category && !categories.has(category)) categories.set(category, 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-col gap-2.5 border-b border-hairline px-4 py-2.5">
        <Tabs
          value={filter}
          onValueChange={(value) => onFilter(value as ReviewFilter)}
        >
          <TabsList variant="pill" aria-label="점검 항목 거르기">
            {FILTERS.map((entry) => (
              <TabsTrigger key={entry.key} value={entry.key}>
                {entry.label} {visibleItems(allItems, entry.key).length}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {categories.size > 1 || category ? (
          <ToggleGroup
            aria-label="분류로 거르기"
            size="sm"
            value={category ? [category] : []}
            onValueChange={(value) =>
              onCategory((value[0] as ReviewCategory | undefined) ?? null)
            }
          >
            {[...categories].map(([key, count]) => (
              <ToggleGroupItem key={key} value={key}>
                {REVIEW_CATEGORY_LABELS[key]} {count}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : null}
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-3 py-3 transition-opacity motion-reduce:transition-none",
          checking && "opacity-50",
        )}
        aria-busy={checking}
      >
        {items.length === 0 ? (
          <p className="px-2 py-8 text-center text-2sm text-muted-foreground">
            {category
              ? `${REVIEW_CATEGORY_LABELS[category]} 분류에 ${EMPTY_MESSAGES[filter]}`
              : EMPTY_MESSAGES[filter]}
          </p>
        ) : (
          groupItems(items).map(({ group, items: rows }) => (
            <section key={group} className="mb-4">
              <h3 className="px-2 pb-1.5 text-2sm font-bold text-muted-foreground">
                {REVIEW_GROUP_LABELS[group]}
              </h3>
              <ul className="flex flex-col gap-1">
                {rows.map((item) => {
                  const status = reviewItemStatus(item);
                  const selected = selectedKey === item.key;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        aria-current={selected || undefined}
                        onClick={() => onSelect(item.key)}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                          selected && "bg-accent ring-1 ring-border",
                          status === "handled" && "opacity-60",
                        )}
                      >
                        <ReviewStatusIcon status={status} className="mt-0.5" />
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm leading-snug font-semibold">
                            {item.title}
                          </span>
                          <span className="truncate text-2sm text-muted-foreground">
                            {REVIEW_CATEGORY_LABELS[item.category]}
                            {item.evidence.text
                              ? ` · ${item.evidence.text}`
                              : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
