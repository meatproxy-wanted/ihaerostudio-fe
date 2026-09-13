import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/domain/project";
import {
  getPublicationStatus,
  getReviewStatus,
  type ReviewStatus,
} from "@/lib/domain/steps";

const REVIEW_BADGES: Record<
  Exclude<ReviewStatus, "unavailable">,
  { label: string; variant: "secondary" | "warning" | "success" }
> = {
  "not-started": { label: "검토 전", variant: "secondary" },
  "in-progress": { label: "검토 중", variant: "warning" },
  completed: { label: "검토 완료", variant: "success" },
  stale: { label: "검토 후 수정됨", variant: "warning" },
};

export function ReviewStatusBadge({ project }: { project: Project }) {
  const status = getReviewStatus(project);
  if (status === "unavailable") {
    return <Badge variant="secondary">초안 전</Badge>;
  }
  const { label, variant } = REVIEW_BADGES[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function PublicationBadge({ project }: { project: Project }) {
  const { publicVersion, latestVersion } = project.publication;
  if (publicVersion !== null) {
    return <Badge variant="negative">공개 중 · v{publicVersion}</Badge>;
  }
  if (latestVersion !== null) {
    const stale = getPublicationStatus(project) === "stale";
    return (
      <Badge variant="secondary">
        내보냄 · v{latestVersion}
        {stale && " 이후 수정"}
      </Badge>
    );
  }
  return null;
}
