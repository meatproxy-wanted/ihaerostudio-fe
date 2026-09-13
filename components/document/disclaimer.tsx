import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

import type { Tone } from "@/lib/domain/common";
import { cn } from "@/lib/utils";

/** Fixed notice on every output; producers cannot edit or remove it. */
export const DISCLAIMER = {
  long: {
    haeyo:
      "이 자료는 판결 내용을 쉽게 설명하려고 만든 자료예요. 공식 판결문을 대신하지 않아요. 정확한 내용은 판결문 원문을 확인해 주세요.",
    hamnida:
      "이 자료는 판결 내용을 쉽게 설명하기 위해 만든 자료입니다. 공식 판결문을 대신하지 않습니다. 정확한 내용은 판결문 원문을 확인해 주십시오.",
  },
  short: {
    haeyo: "공식 판결문이 아닌 쉬운 설명자료예요",
    hamnida: "공식 판결문이 아닌 쉬운 설명자료입니다",
  },
} satisfies Record<"long" | "short", Record<Tone, string>>;

export function DisclaimerBox({
  tone,
  className,
}: {
  tone: Tone;
  className?: string;
}) {
  return (
    <aside
      aria-label="안내"
      className={cn(
        "flex items-start gap-3 rounded-2xl bg-info/8 p-4 text-info ring-1 ring-info/20",
        className,
      )}
    >
      <HugeiconsIcon
        icon={InformationCircleIcon}
        strokeWidth={2}
        className="mt-0.5 size-[1.25em] shrink-0"
      />
      <p className="leading-relaxed font-medium [word-break:keep-all] text-foreground">
        {DISCLAIMER.long[tone]}
      </p>
    </aside>
  );
}
