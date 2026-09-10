"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Delete02Icon,
  Download04Icon,
  PlusSignIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

export function ButtonShowcase() {
  return (
    <ShowcaseSection
      id="button"
      title="Button"
      description="브랜드 채움(default), 연한 채움(weak), 회색 채움(secondary) 등 토스 버튼 위계와 4단계 크기를 제공합니다."
    >
      <ShowcaseCase label="Variants">
        <Button>Default</Button>
        <Button variant="weak">Weak</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="neutral">Neutral</Button>
        <Button variant="link">Link</Button>
      </ShowcaseCase>

      <ShowcaseCase label="Sizes" description="24 / 32 / 36 / 44px">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </ShowcaseCase>

      <ShowcaseCase label="Icon sizes" description="아이콘만 있는 정사각 버튼">
        <Button size="icon-xs" variant="secondary" aria-label="설정">
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
        </Button>
        <Button size="icon-sm" variant="secondary" aria-label="설정">
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
        </Button>
        <Button size="icon" variant="secondary" aria-label="설정">
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
        </Button>
        <Button size="icon-lg" variant="secondary" aria-label="설정">
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
        </Button>
      </ShowcaseCase>

      <ShowcaseCase
        label="With icon"
        description="data-icon 속성으로 아이콘 쪽 패딩이 자동 조정됩니다"
      >
        <Button>
          <HugeiconsIcon
            icon={PlusSignIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          새로 만들기
        </Button>
        <Button variant="secondary">
          <HugeiconsIcon
            icon={Download04Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          다운로드
        </Button>
        <Button variant="weak">
          다음
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            data-icon="inline-end"
          />
        </Button>
        <Button variant="destructive">
          <HugeiconsIcon
            icon={Delete02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          삭제
        </Button>
      </ShowcaseCase>

      <ShowcaseCase
        label="CTA pair"
        description="토스 하단 CTA처럼 secondary + default를 나란히 배치"
        className="block"
      >
        <div className="flex max-w-sm gap-2">
          <Button variant="secondary" size="lg" className="flex-1">
            취소
          </Button>
          <Button size="lg" className="flex-[2]">
            주문 확정하기
          </Button>
        </div>
      </ShowcaseCase>

      <ShowcaseCase label="Loading">
        <Button disabled>
          <Spinner data-icon="inline-start" />
          저장 중...
        </Button>
        <Button variant="secondary" disabled>
          <Spinner data-icon="inline-start" />
          불러오는 중
        </Button>
        <Button size="icon" variant="ghost" disabled aria-label="로딩 중">
          <Spinner />
        </Button>
      </ShowcaseCase>

      <ShowcaseCase label="Disabled">
        <Button disabled>Default</Button>
        <Button variant="weak" disabled>
          Weak
        </Button>
        <Button variant="secondary" disabled>
          Secondary
        </Button>
        <Button variant="outline" disabled>
          Outline
        </Button>
        <Button variant="destructive" disabled>
          Destructive
        </Button>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
