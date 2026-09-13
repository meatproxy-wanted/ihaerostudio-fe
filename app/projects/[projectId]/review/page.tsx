import { Suspense } from "react";
import type { Metadata } from "next";

import { PanesSkeleton } from "@/components/app/panes-skeleton";
import { ReviewScreen } from "@/components/review/review-screen";

export const metadata: Metadata = { title: "검토하기" };

export default function ReviewPage() {
  return (
    <Suspense fallback={<PanesSkeleton />}>
      <ReviewScreen />
    </Suspense>
  );
}
