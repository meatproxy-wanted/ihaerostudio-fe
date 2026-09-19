"use client";

import EmptyIllustration from "@/components/ui/EmptyIllustration";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { errorMessage } from "@/lib/api/errors";

export function ErrorState({
  title = "불러오지 못했어요",
  error,
  onRetry,
  className,
}: {
  title?: string;
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia className="mb-1">
          <EmptyIllustration variant="error" width={150} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{errorMessage(error)}</EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            다시 시도
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
