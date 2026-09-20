import { Suspense } from "react";
import type { Metadata } from "next";

import { Workspace } from "@/components/projects/workspace";

export const metadata: Metadata = {
  title: "작업함",
};

export default function WorkspacePage() {
  return (
    <Suspense>
      <Workspace />
    </Suspense>
  );
}
