"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cacheProject } from "@/lib/api/hooks";
import type { Project } from "@/lib/domain/project";

/** The project title, editable in place. */
export function ProjectTitle({ project }: { project: Project }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<string | null>(null);
  const rename = useMutation({
    mutationFn: (title: string) => api.projects.rename(project.id, title),
    onSuccess: (updated) => cacheProject(queryClient, updated),
    onError: (error) =>
      toast.add({
        title: "제목을 바꾸지 못했어요",
        description: errorMessage(error),
        type: "error",
      }),
  });

  function commit() {
    if (draft === null) return;
    const title = draft.trim();
    setDraft(null);
    if (title && title !== project.title) rename.mutate(title);
  }

  if (draft !== null) {
    return (
      <input
        autoFocus
        value={draft}
        aria-label="자료 제목"
        maxLength={80}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") setDraft(null);
        }}
        className="h-8 w-full min-w-0 rounded-md border border-primary bg-card px-2 text-sm font-semibold outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setDraft(project.title)}
      title="눌러서 제목 바꾸기"
      className="h-8 min-w-0 truncate rounded-md px-2 text-left text-sm font-semibold hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none"
    >
      {rename.isPending ? (rename.variables ?? project.title) : project.title}
    </button>
  );
}
