"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon, Search02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

export function FeedbackShowcase() {
  return (
    <ShowcaseSection
      id="feedback"
      title="Feedback"
      description="빈 상태, 진행률, 스켈레톤과 스피너처럼 데이터가 없거나 기다리는 순간을 표현합니다."
    >
      <ShowcaseCase label="Empty" className="block">
        <Empty className="py-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Search02Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>조건에 맞는 주문이 없습니다</EmptyTitle>
            <EmptyDescription>
              검색어나 상태 필터를 바꿔 다시 확인해 주세요.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary" size="sm">
              <HugeiconsIcon
                icon={Refresh01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              필터 초기화
            </Button>
          </EmptyContent>
        </Empty>
      </ShowcaseCase>

      <ShowcaseCase label="Progress" className="grid gap-5 md:grid-cols-2">
        <Progress value={64}>
          <ProgressLabel>월 목표 달성률</ProgressLabel>
          <ProgressValue />
        </Progress>
        <Progress value={28}>
          <ProgressLabel>스토리지 사용량</ProgressLabel>
          <ProgressValue />
        </Progress>
      </ShowcaseCase>

      <ShowcaseCase label="Skeleton" className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-3.5 w-16" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </ShowcaseCase>

      <ShowcaseCase label="Spinner">
        <Spinner className="size-4" />
        <Spinner />
        <Spinner className="size-6 text-primary-text" />
        <span className="flex items-center gap-2 text-2sm font-medium text-muted-foreground">
          <Spinner className="size-4" />
          불러오는 중
        </span>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
