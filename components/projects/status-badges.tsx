import type { VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "@/components/ui/badge";
import type { Project } from "@/lib/domain/project";
import {
  getPublicationStatus,
  getReviewStatus,
  type ReviewStatus,
} from "@/lib/domain/steps";

/** Callers pick the size; the badge keeps its own colour either way. */
type BadgeSize = VariantProps<typeof badgeVariants>["size"];

const REVIEW_BADGES: Record<
  Exclude<ReviewStatus, "unavailable">,
  { label: string; variant: "secondary" | "warning" | "success" }
> = {
  "not-started": { label: "검토 전", variant: "secondary" },
  "in-progress": { label: "검토 중", variant: "warning" },
  completed: { label: "검토 완료", variant: "success" },
  stale: { label: "검토 후 수정됨", variant: "warning" },
};

export function ReviewStatusBadge({
  project,
  size,
}: {
  project: Project;
  size?: BadgeSize;
}) {
  const status = getReviewStatus(project);
  if (status === "unavailable") {
    return (
      <Badge variant="secondary" size={size}>
        초안 전
      </Badge>
    );
  }
  const { label, variant } = REVIEW_BADGES[status];
  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}

export function PublicationBadge({
  project,
  size,
}: {
  project: Project;
  size?: BadgeSize;
}) {
  const { publicVersion, latestVersion } = project.publication;
  if (publicVersion !== null) {
    return (
      <Badge variant="negative" size={size}>
        공개 중 · v{publicVersion}
      </Badge>
    );
  }
  if (latestVersion !== null) {
    const stale = getPublicationStatus(project) === "stale";
    return (
      <Badge variant="secondary" size={size}>
        내보냄 · v{latestVersion}
        {stale && " 이후 수정"}
      </Badge>
    );
  }
  return null;
}
