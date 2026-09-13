import type { Metadata } from "next";

import { StepPlaceholder } from "@/components/project-shell/step-placeholder";

export const metadata: Metadata = { title: "사건 구조 확인" };

export default function Page() {
  return <StepPlaceholder title="사건 구조 확인" />;
}
