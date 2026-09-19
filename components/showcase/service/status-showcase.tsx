"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ShowcaseCase, ShowcaseSection } from "../showcase-section";

export function StatusShowcase() {
  return (
    <ShowcaseSection
      id="status"
      title="상태"
      description="단계 상태, 검토 지적, 생성 진행률처럼 '지금 어디까지 됐는지'를 알리는 표시들입니다. 상승·하락 같은 금융 의미는 쓰지 않습니다."
    >
      <ShowcaseCase
        label="Badge"
        description="secondary 5곳 · warning 5곳 · negative 3곳 · success 1곳 · outline 1곳"
      >
        <Badge variant="secondary">검토 중</Badge>
        <Badge variant="warning">확인 필요 9</Badge>
        <Badge variant="negative">초안이 옛날 거예요</Badge>
        <Badge variant="success">검토 완료</Badge>
        <Badge variant="outline">2024가단10234</Badge>
      </ShowcaseCase>

      <ShowcaseCase
        label="Alert"
        description="warning 2곳 · info 1곳 — 그 외 변형은 쓰지 않음"
        className="block gap-3"
      >
        <Alert variant="warning">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>점검한 뒤에 문서가 바뀌었어요</AlertTitle>
          <AlertDescription>
            다시 점검한 뒤에 검토를 마칠 수 있어요.
          </AlertDescription>
        </Alert>
        <Alert variant="info">
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
          <AlertTitle>원문과 대조하지 않은 문장이 34개 남았어요</AlertTitle>
          <AlertDescription>대조는 검토 완료를 막지 않아요.</AlertDescription>
        </Alert>
      </ShowcaseCase>

      <ShowcaseCase
        label="Progress"
        description="2곳 — 그림 생성, 도구 진행률"
        className="block"
      >
        <div className="flex w-full max-w-md flex-col gap-2">
          <Progress value={62} />
          <p className="text-sm text-muted-foreground tabular-nums">
            8 / 13개 완료
          </p>
        </div>
      </ShowcaseCase>

      <ShowcaseCase label="Spinner" description="6곳 — 버튼 안, 짧은 대기">
        <Spinner />
        <span className="inline-flex items-center gap-2 text-sm">
          <Spinner />
          불러오는 중…
        </span>
      </ShowcaseCase>

      <ShowcaseCase
        label="Skeleton"
        description="6곳 — 편집 카드·목록이 오기 전"
        className="block"
      >
        <div className="flex w-full max-w-md flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </ShowcaseCase>

      <ShowcaseCase
        label="Empty"
        description="7곳 — 작업함이 비었을 때, 볼 수 없는 자료"
        className="block"
      >
        <Empty className="w-full rounded-xl bg-background py-10">
          <EmptyHeader className="max-w-md gap-2">
            <EmptyTitle>아직 만든 자료가 없어요</EmptyTitle>
            <EmptyDescription>
              판결문을 올리면 AI가 사건 구조를 정리해요.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
