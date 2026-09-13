import type { Metadata } from "next";

import { ExportScreen } from "@/components/export/export-screen";

export const metadata: Metadata = { title: "내보내기" };

export default function ExportPage() {
  return <ExportScreen />;
}
