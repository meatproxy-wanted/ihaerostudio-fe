import { Suspense } from "react";
import type { Metadata } from "next";

import { AppHeader } from "@/components/app/app-header";
import { NewProjectForm } from "@/components/new-project/new-project-form";

export const metadata: Metadata = {
  title: "새 자료 만들기",
};

export default function NewProjectPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />
      <Suspense>
        <NewProjectForm />
      </Suspense>
    </div>
  );
}
