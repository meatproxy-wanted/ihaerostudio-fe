import Link from "next/link";

import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

/**
 * The symbol on its own, for places that already carry the name in text.
 * Sized in px because the logo scales from a single `--logo-size`.
 */
export function BrandMark({
  size = 26,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return <Logo layout="symbol-only" size={size} className={className} />;
}

/**
 * Logo that returns to the landing page. `compact` drops the wordmark, for
 * bars that are already crowded — the project shell on a narrow screen.
 */
export function BrandLink({
  compact = false,
  size = 20,
  className,
}: {
  compact?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <Link
      href={routes.home()}
      className={cn(
        "flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
        className,
      )}
      aria-label="이해로 스튜디오 홈으로 가기"
    >
      <Logo layout={compact ? "symbol-only" : "full"} size={size} />
    </Link>
  );
}
