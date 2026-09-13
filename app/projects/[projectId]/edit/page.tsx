import type { Metadata } from "next";

import { StepPlaceholder } from "@/components/project-shell/step-placeholder";

export const metadata: Metadata = { title: "쉬운 글·그림 편집" };

export default function Page() {
  return <StepPlaceholder title="쉬운 글·그림 편집" />;
}
