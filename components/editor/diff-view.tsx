import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import { diffWords, numberChanges } from "@/lib/domain/text-diff";

/** Before and after, each line marking only its own side of the change. */
export function DiffView({ before, after }: { before: string; after: string }) {
  const parts = diffWords(before, after);
  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-card p-3 ring-1 ring-hairline">
      <div>
        <p className="mb-0.5 text-[11px] font-semibold text-muted-foreground">
          지금
        </p>
        <p className="text-md leading-relaxed [word-break:keep-all]">
          {parts.map((part, index) =>
            part.type === "added" ? null : (
              <span
                key={index}
                className={
                  part.type === "removed"
                    ? "rounded-sm bg-destructive/10 text-destructive line-through decoration-2"
                    : undefined
                }
              >
                {part.text}
              </span>
            ),
          )}
        </p>
      </div>
      <div>
        <p className="mb-0.5 text-[11px] font-semibold text-muted-foreground">
          수정안
        </p>
        <p className="text-md leading-relaxed [word-break:keep-all]">
          {parts.map((part, index) =>
            part.type === "removed" ? null : (
              <span
                key={index}
                className={
                  part.type === "added"
                    ? "rounded-sm bg-success/15 font-semibold text-success underline decoration-2 underline-offset-4"
                    : undefined
                }
              >
                {part.text}
              </span>
            ),
          )}
        </p>
      </div>
      <span className="sr-only">
        지운 말:{" "}
        {parts
          .filter((p) => p.type === "removed")
          .map((p) => p.text)
          .join(", ") || "없음"}
        . 넣은 말:{" "}
        {parts
          .filter((p) => p.type === "added")
          .map((p) => p.text)
          .join(", ") || "없음"}
        .
      </span>
    </div>
  );
}

/** Loud warning when a rewrite changes an amount, date, rate, or period. */
export function NumberWarning({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const { removed, added } = numberChanges(before, after);
  if (removed.length === 0 && added.length === 0) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-2sm text-destructive"
    >
      <HugeiconsIcon
        icon={Alert02Icon}
        strokeWidth={2}
        size={16}
        className="mt-0.5 shrink-0"
      />
      <span>
        <span className="font-bold">숫자가 바뀌었어요: </span>
        {removed.map((m) => m.text).join(", ") || "없음"} →{" "}
        {added.map((m) => m.text).join(", ") || "없음"}. 원문과 꼭 확인해
        주세요.
      </span>
    </div>
  );
}
