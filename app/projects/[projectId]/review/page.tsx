import type { Metadata } from "next";

import { StepPlaceholder } from "@/components/project-shell/step-placeholder";

export const metadata: Metadata = { title: "검토하기" };

export default function Page() {
  return <StepPlaceholder title="검토하기" />;
}
