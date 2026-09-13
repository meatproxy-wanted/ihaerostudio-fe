import { Suspense } from "react";
import type { Metadata } from "next";

import { PrintScreen } from "@/components/print/print-screen";

export const metadata: Metadata = {
  title: "인쇄용 PDF",
  robots: { index: false },
};

export default async function PrintPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense>
      <PrintScreen projectId={projectId} />
    </Suspense>
  );
}
