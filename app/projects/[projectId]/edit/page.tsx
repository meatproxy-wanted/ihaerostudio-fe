import { Suspense } from "react";
import type { Metadata } from "next";

import { PanesSkeleton } from "@/components/app/panes-skeleton";
import { EditorScreen } from "@/components/editor/editor-screen";

export const metadata: Metadata = { title: "쉬운 글·그림 편집" };

export default function EditPage() {
  return (
    <Suspense fallback={<PanesSkeleton panes={3} />}>
      <EditorScreen />
    </Suspense>
  );
}
