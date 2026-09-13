import type { EditorLink } from "@/lib/routes";
import {
  REVIEW_CATEGORY_GROUP,
  type ReviewGroup,
  type ReviewItem,
} from "@/lib/domain/review";

export type ReviewFilter = "open" | "done" | "all";

export const GROUP_ORDER: ReviewGroup[] = ["meaning", "readability", "output"];

export function isHandled(item: ReviewItem) {
  return item.dismissal !== null;
}

export function visibleItems(items: ReviewItem[], filter: ReviewFilter) {
  return items.filter((item) =>
    filter === "all"
      ? true
      : filter === "open"
        ? !isHandled(item)
        : isHandled(item),
  );
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
