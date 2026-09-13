import type { Metadata } from "next";

import { AppHeader } from "@/components/app/app-header";
import { ProjectList } from "@/components/projects/project-list";

export const metadata: Metadata = {
  title: "작업함",
};

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />
      <ProjectList />
    </div>
  );
}
