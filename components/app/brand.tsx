import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { JusticeScale01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground",
        className,
      )}
    >
      <HugeiconsIcon icon={JusticeScale01Icon} strokeWidth={2} size={18} />
    </span>
  );
}

/** Logo that returns to the project list. */
export function BrandLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={routes.home()}
      className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
      aria-label="이해로 스튜디오 작업함으로 가기"
    >
      <BrandMark />
      {!compact && (
        <span className="text-md font-bold tracking-tight">
          이해로 스튜디오
        </span>
      )}
    </Link>
  );
}
