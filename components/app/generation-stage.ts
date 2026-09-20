import type { GenerationStage } from "@/components/ui/GenerationLoading";
import type { ImagePreparationProgress } from "@/lib/api/types";

/**
 * The mapping layer between what this server reports and what the loading
 * screen shows.
 *
 * The screen names four stages of one pipeline. The server splits that
 * pipeline across three calls, and only the last of them reports progress:
 *
 *   POST /projects            reading → structure   no progress, one await
 *   POST /document/generate   rewrite               no progress, one await
 *   image preparation         illustrate            completed / total, live
 *
 * So the first two are estimated on a timer — which is what the loader it
 * replaces already did — and only the pictures show a true count. Should the
 * server grow a progress channel for the other two, this is the one file
 * that has to learn about it.
 */

/** Stages each call walks through, in order, while it is waiting. */
export const ANALYSIS_STAGES: GenerationStage[] = ["reading", "structure"];
export const DRAFT_STAGES: GenerationStage[] = ["rewrite"];

/** The picture pass is the one place with a real count to show. */
export function fromImageProgress(
  progress: ImagePreparationProgress | undefined,
): {
  stage: GenerationStage;
  count?: { current: number; total: number };
} {
  if (progress && progress.phase === "complete") return { stage: "done" };
  return {
    stage: "illustrate",
    count: progress?.total
      ? { current: progress.completed, total: progress.total }
      : undefined,
  };
}
