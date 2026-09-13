"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useLongJob } from "@/components/app/long-job";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { cacheProject } from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/query-keys";

/** What remaking the draft costs, worded the same wherever it is offered. */
export function regenerateWarning(touchedSentences: number | null): string {
  return touchedSentences
    ? `지금까지 손본 문장 ${touchedSentences}개가 사라지고 새 초안으로 바뀌어요. 되돌릴 수 없어요.`
    : "지금 초안이 새 초안으로 바뀌어요. 되돌릴 수 없어요.";
}

/**
 * Makes (or remakes) the draft behind the multi-step loader. Pending edits
 * are saved first because the draft is built from what the server has; the
 * last check described the old draft, so it is dropped.
 */
export function useGenerateDraft({
  projectId,
  save,
  onGenerated,
}: {
  projectId: string;
  /** Saves pending edits; resolves false when they could not be saved. */
  save: () => Promise<boolean>;
  onGenerated: () => void;
}) {
  const queryClient = useQueryClient();
  return useLongJob({
    run: async (_input: void, signal) => {
      if (!(await save())) {
        throw new ApiError(
          "failed",
          "고친 내용을 저장하지 못해서 초안을 만들 수 없어요. 저장을 다시 시도해 주세요.",
        );
      }
      return api.document.generate(projectId, { signal });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.document(projectId), result.document);
      cacheProject(queryClient, result.project);
      queryClient.removeQueries({ queryKey: queryKeys.review(projectId) });
      onGenerated();
    },
  });
}
