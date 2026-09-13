import type { EditorLink } from "@/lib/routes";
import {
  REVIEW_CATEGORY_GROUP,
  reviewCategorySchema,
  reviewItemStatus,
  type ReviewCategory,
  type ReviewGroup,
  type ReviewItem,
} from "@/lib/domain/review";

export type ReviewFilter = "open" | "done" | "all";

const REVIEW_FILTERS: readonly ReviewFilter[] = ["open", "done", "all"];

export const GROUP_ORDER: ReviewGroup[] = ["meaning", "readability", "output"];

/** Reads `?show=` and `?category=`, ignoring values the screen doesn't know. */
export function parseReviewParams(params: URLSearchParams): {
  filter: ReviewFilter;
  category: ReviewCategory | null;
} {
  const show = params.get("show");
  const category = reviewCategorySchema.safeParse(params.get("category"));
  return {
    filter: REVIEW_FILTERS.find((filter) => filter === show) ?? "open",
    category: category.success ? category.data : null,
  };
}

export function isHandled(item: ReviewItem) {
  return reviewItemStatus(item) === "handled";
}

export function visibleItems(
  items: ReviewItem[],
  filter: ReviewFilter,
  category: ReviewCategory | null = null,
) {
  return items.filter(
    (item) =>
      (filter === "all" || (filter === "open") !== isHandled(item)) &&
      (category === null || item.category === category),
  );
}

/** Categories present in the items, in the order the list groups them. */
export function categoryCounts(items: ReviewItem[]) {
  const counts = new Map<ReviewCategory, number>();
  for (const category of reviewCategorySchema.options) {
    const count = items.filter((item) => item.category === category).length;
    if (count > 0) counts.set(category, count);
  }
  return counts;
}

/** Items grouped the way the list shows them: required before suggested. */
export function groupItems(items: ReviewItem[]) {
  return GROUP_ORDER.map((group) => ({
    group,
    items: items
      .filter((item) => REVIEW_CATEGORY_GROUP[item.category] === group)
      .sort(
        (a, b) =>
          Number(isHandled(a)) - Number(isHandled(b)) ||
          Number(a.level === "suggested") - Number(b.level === "suggested"),
      ),
  })).filter((entry) => entry.items.length > 0);
}

/** Where "fix in the editor" should land for an item. */
export function editorLinkFor(item: ReviewItem): EditorLink {
  const { target } = item;
  const base: EditorLink = { fromReview: true };
  switch (target.type) {
    case "sentence":
      return {
        ...base,
        sentence: target.sentenceId,
        tool:
          item.category === "long-sentence"
            ? "split"
            : item.category === "hard-term"
              ? "term"
              : undefined,
      };
    case "card":
      return { ...base, card: target.cardId };
    case "image":
      return { ...base, card: target.cardId, tool: "image" };
    default:
      return base;
  }
}
