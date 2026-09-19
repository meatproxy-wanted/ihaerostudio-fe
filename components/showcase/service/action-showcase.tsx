"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PencilEdit02Icon,
  PlusSignIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShowcaseCase, ShowcaseSection } from "../showcase-section";

export function ActionShowcase() {
  return (
    <ShowcaseSection
      id="action"
      title="Button"
      description="서비스가 실제로 쓰는 변형은 ghost·secondary가 대부분이고, 나머지는 강조나 파괴적 동작에만 씁니다. outline·danger·link는 Button에 쓰지 않습니다."
    >
      <ShowcaseCase
        label="Variants"
        description="ghost 40곳 · secondary 38곳 · default · weak 2곳 · destructive 2곳 · neutral 1곳"
      >
        <Button>초안 만들기</Button>
        <Button variant="secondary">더 볼게요</Button>
        <Button variant="ghost">취소</Button>
        <Button variant="weak">다음</Button>
        <Button variant="destructive">지우기</Button>
        <Button variant="neutral">확인</Button>
      </ShowcaseCase>

      <ShowcaseCase
        label="Sizes"
        description="sm 64곳 · xs 18곳 · lg 7곳 · default"
      >
        <Button size="xs">문제없음으로 확인</Button>
        <Button size="sm">편집기에서 고치기</Button>
        <Button>대조하러 가기</Button>
        <Button size="lg">AI 분석 시작하기</Button>
      </ShowcaseCase>

      <ShowcaseCase
        label="Icon only"
        description="icon-xs 10곳 · icon-sm 6곳 · aria-label 필수"
      >
        <Button size="icon-xs" variant="ghost" aria-label="문장 수정">
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="자료 설정">
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
        </Button>
        <Button size="icon-sm" variant="secondary" aria-label="인물 추가">
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="항목 지우기">
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
        </Button>
      </ShowcaseCase>

      <ShowcaseCase label="With icon" description="data-icon으로 패딩이 조정됨">
        <Button size="sm">
          <HugeiconsIcon
            icon={PlusSignIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          사실 추가
        </Button>
        <Button size="sm" variant="secondary">
          <HugeiconsIcon
            icon={PencilEdit02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          직접 수정하기
        </Button>
      </ShowcaseCase>

      <ShowcaseCase label="Pending" description="요청 중에는 Spinner를 앞에 둠">
        <Button size="sm" disabled>
          <Spinner data-icon="inline-start" />
          저장 중…
        </Button>
        <Button variant="secondary" disabled>
          <Spinner data-icon="inline-start" />
          점검하고 있어요…
        </Button>
      </ShowcaseCase>

      <ShowcaseCase
        label="Disabled"
        description="조건을 아직 못 갖췄을 때 — 왜 막혔는지 옆에 설명을 함께 둘 것"
      >
        <Button disabled>초안 만들기</Button>
        <Button variant="secondary" disabled>
          검토 완료로 표시
        </Button>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
