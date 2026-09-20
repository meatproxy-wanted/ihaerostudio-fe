import { Suspense } from "react";
import type { Metadata } from "next";

import { AppShell } from "@/components/app/app-shell";
import { NewProjectForm } from "@/components/new-project/new-project-form";

export const metadata: Metadata = {
  title: "새 자료 만들기",
};

export default function NewProjectPage() {
  return (
    <AppShell>
      <Suspense>
        <NewProjectForm />
      </Suspense>
    </AppShell>
  );
}
