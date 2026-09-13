import type { Project } from "./project";

export const STEP_KEYS = [
  "upload",
  "structure",
  "edit",
  "review",
  "preview",
  "export",
] as const;
export type StepKey = (typeof STEP_KEYS)[number];

export const STEP_LABELS: Record<StepKey, string> = {
  upload: "올리기",
  structure: "사건 구조",
  edit: "편집",
  review: "검토",
  preview: "미리보기",
  export: "내보내기",
};

/**
 * - `done`: finished for the current content
 * - `todo`: not finished yet (or not reachable yet)
 * - `attention`: finished, but something upstream changed afterwards
 * - `stale`: finished for an older version of the content
 * - `none`: the step has no notion of being finished
 */
export type StepStatus = "done" | "todo" | "attention" | "stale" | "none";

export type ReviewStatus =
  "unavailable" | "not-started" | "in-progress" | "completed" | "stale";

export type PublicationStatus = "unavailable" | "none" | "current" | "stale";

export interface StepState {
  key: StepKey;
  number: number;
  label: string;
  enterable: boolean;
  status: StepStatus;
}

/** The case structure or settings changed after the draft was generated. */
export function isDraftOutdated(project: Project): boolean {
  const { document } = project;
  if (!document) return false;
  return (
    project.structureRevision > document.basedOnStructureRevision ||
    project.settingsRevision > document.basedOnSettingsRevision
  );
}

export function getReviewStatus(project: Project): ReviewStatus {
  const { document, review } = project;
  if (!document) return "unavailable";
  if (review.completedContentRevision !== null) {
    return review.completedContentRevision === document.contentRevision
      ? "completed"
      : "stale";
  }
  return review.checkedContentRevision === null ? "not-started" : "in-progress";
}

export function getPublicationStatus(project: Project): PublicationStatus {
  const { document, publication } = project;
  if (!document) return "unavailable";
  if (publication.latestContentRevision === null) return "none";
  return publication.latestContentRevision === document.contentRevision
    ? "current"
    : "stale";
}

export function canEnterStep(project: Project, step: StepKey): boolean {
  switch (step) {
    case "upload":
      return false;
    case "structure":
      return true;
    default:
      return project.document !== null;
  }
}

function statusOf(project: Project, step: StepKey): StepStatus {
  const hasDraft = project.document !== null;

  switch (step) {
    case "upload":
      return "done";
    case "structure":
      if (!hasDraft) return "todo";
      return isDraftOutdated(project) ? "attention" : "done";
    case "edit":
    case "preview":
      return hasDraft ? "none" : "todo";
    case "review": {
      const review = getReviewStatus(project);
      if (review === "completed") return "done";
      return review === "stale" ? "stale" : "todo";
    }
    case "export": {
      const publication = getPublicationStatus(project);
      if (publication === "current") return "done";
      return publication === "stale" ? "stale" : "todo";
    }
  }
}

export function getSteps(project: Project): StepState[] {
  return STEP_KEYS.map((key, index) => ({
    key,
    number: index + 1,
    label: STEP_LABELS[key],
    enterable: canEnterStep(project, key),
    status: statusOf(project, key),
  }));
}

/** Where "continue" should take the producer: the furthest step reached. */
export function getResumeStep(project: Project): StepKey {
  switch (getReviewStatus(project)) {
    case "unavailable":
      return "structure";
    case "not-started":
      return "edit";
    case "in-progress":
    case "stale":
      return "review";
    case "completed":
      return "export";
  }
}
