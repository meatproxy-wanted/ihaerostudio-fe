import type { Metadata } from "next";

import { PublicReader } from "@/components/reader/public-reader";

export const metadata: Metadata = {
  title: "쉬운 설명자료",
  robots: { index: false },
};

export default async function ReadPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <PublicReader projectId={projectId} />;
}
