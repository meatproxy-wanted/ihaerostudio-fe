"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

const stack = "flex flex-col gap-3";

export function AlertShowcase() {
  return (
    <ShowcaseSection
      id="alert"
      title="Alert"
      description="테두리 대신 틴트 배경으로 구분하는 안내 블록입니다. brand는 토스의 파란 콜아웃 스타일입니다."
    >
      <ShowcaseCase label="Default" className={stack}>
        <Alert>
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
          <AlertTitle>새 버전이 배포되었습니다</AlertTitle>
          <AlertDescription>
            변경 사항을 반영하려면 페이지를 새로고침하세요.
          </AlertDescription>
        </Alert>
      </ShowcaseCase>

      <ShowcaseCase label="Semantic" className={stack}>
        <Alert variant="info">
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
          <AlertTitle>정산 일정이 변경되었습니다</AlertTitle>
          <AlertDescription>
            9월 정산은 영업일 기준 3일 뒤인 12일에 지급됩니다.
          </AlertDescription>
        </Alert>
        <Alert variant="success">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
          <AlertTitle>백업이 완료되었습니다</AlertTitle>
          <AlertDescription>
            총 1,284개 항목이 안전하게 저장되었습니다.
          </AlertDescription>
        </Alert>
        <Alert variant="warning">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>결제 수단 만료 예정</AlertTitle>
          <AlertDescription>
            등록된 카드가 이번 달 말 만료됩니다. 새 카드를 등록해 주세요.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>저장에 실패했습니다</AlertTitle>
          <AlertDescription>
            네트워크 연결을 확인한 뒤 다시 시도해 주세요.
          </AlertDescription>
        </Alert>
      </ShowcaseCase>

      <ShowcaseCase
        label="Brand callout"
        description="토스 홈의 파란 툴팁 콜아웃"
        className={stack}
      >
        <Alert variant="brand" className="max-w-sm">
          <AlertTitle>요즘 어디로 돈이 몰리는지 보여요</AlertTitle>
          <AlertDescription>
            새로워진 ‘지금 뜨는 산업’에서 거래대금 순으로도 볼 수 있어요.
          </AlertDescription>
        </Alert>
      </ShowcaseCase>

      <ShowcaseCase label="With action" className={stack}>
        <Alert>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
          <AlertTitle>백업이 완료되었습니다</AlertTitle>
          <AlertDescription>
            총 1,284개 항목이 안전하게 저장되었습니다.
          </AlertDescription>
          <AlertAction>
            <Button size="xs" variant="outline">
              보기
            </Button>
          </AlertAction>
        </Alert>
      </ShowcaseCase>

      <ShowcaseCase label="Title only" className={stack}>
        <Alert>
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
          <AlertTitle>점검 예정: 9월 5일 02:00 ~ 04:00 (KST)</AlertTitle>
        </Alert>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
