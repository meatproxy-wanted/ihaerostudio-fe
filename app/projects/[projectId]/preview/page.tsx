import { Suspense } from "react";
import type { Metadata } from "next";

import { PanesSkeleton } from "@/components/app/panes-skeleton";
import { PreviewScreen } from "@/components/preview/preview-screen";

export const metadata: Metadata = { title: "결과물 미리보기" };

export default function PreviewPage() {
  return (
    <Suspense fallback={<PanesSkeleton panes={1} />}>
      <PreviewScreen />
    </Suspense>
  );
}
