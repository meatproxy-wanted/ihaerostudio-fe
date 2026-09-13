import type { ReactNode } from "react";

/**
 * Reader-facing pages: no app chrome, always the light paper surface
 * regardless of the producer's theme.
 */
export default function PaperLayout({ children }: { children: ReactNode }) {
  return <div className="paper flex min-h-svh flex-col">{children}</div>;
}
