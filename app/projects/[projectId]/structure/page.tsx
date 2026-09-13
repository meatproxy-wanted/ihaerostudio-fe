import type { Metadata } from "next";

import { StructureScreen } from "@/components/structure/structure-screen";

export const metadata: Metadata = { title: "사건 구조 확인" };

export default function StructurePage() {
  return <StructureScreen />;
}
