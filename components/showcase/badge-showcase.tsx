"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

export function BadgeShowcase() {
  return (
    <ShowcaseSection
      id="badge"
      title="Badge"
      description="토스 태그처럼 낮은 높이(20px), 5px 라운드, 연한 틴트 배경으로 상태와 카테고리를 표시합니다."
    >
      <ShowcaseCase label="Variants">
        <Badge>Default</Badge>
        <Badge variant="solid">Solid</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="link">Link</Badge>
      </ShowcaseCase>

      <ShowcaseCase
        label="Semantic"
        description="positive(상승) / negative(하락) / warning / success"
      >
        <Badge variant="positive">+3.71%</Badge>
        <Badge variant="negative">-1.98%</Badge>
        <Badge variant="warning">팔로워 부자</Badge>
        <Badge variant="success">검진 완료</Badge>
      </ShowcaseCase>

      <ShowcaseCase label="Sizes" description="16 / 20 / 24px">
        <Badge size="sm">인기</Badge>
        <Badge size="default">인기</Badge>
        <Badge size="lg">인기</Badge>
        <Badge size="lg" variant="secondary" className="rounded-full">
          메모 작성
        </Badge>
      </ShowcaseCase>

      <ShowcaseCase label="With icon">
        <Badge variant="success">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          승인됨
        </Badge>
        <Badge variant="destructive">
          <HugeiconsIcon
            icon={Alert02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          오류
        </Badge>
        <Badge variant="outline">
          자세히
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            data-icon="inline-end"
          />
        </Badge>
      </ShowcaseCase>

      <ShowcaseCase
        label="Status"
        description="관리자 화면에서 자주 쓰는 상태 표현"
      >
        <Badge variant="success">활성</Badge>
        <Badge variant="warning">대기</Badge>
        <Badge variant="destructive">정지</Badge>
        <Badge variant="secondary">보관됨</Badge>
        <Badge variant="default">신규</Badge>
      </ShowcaseCase>

      <ShowcaseCase label="As link" description="render prop으로 앵커로 렌더링">
        <Badge render={<a href="#badge" />} variant="outline">
          #badge
        </Badge>
        <Badge render={<a href="#button" />} variant="secondary">
          #button
        </Badge>
      </ShowcaseCase>

      <ShowcaseCase label="Inline with text">
        <p className="text-sm">
          이 기능은 <Badge variant="secondary">베타</Badge> 단계이며 다음
          릴리스에서 <Badge>정식</Badge> 출시될 예정입니다.
        </p>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
