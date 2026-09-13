import type { Metadata } from "next";

import { StepPlaceholder } from "@/components/project-shell/step-placeholder";

export const metadata: Metadata = { title: "결과물 미리보기" };

export default function Page() {
  return <StepPlaceholder title="결과물 미리보기" />;
}
