"use client";

import EmptyIllustration from "@/components/ui/EmptyIllustration";
import Logo from "@/components/ui/Logo";
import { ShowcaseCase, ShowcaseSection } from "../showcase-section";

export function BrandShowcase() {
  return (
    <ShowcaseSection
      id="brand"
      title="Brand"
      description="로고와 빈 화면 그림입니다. 둘 다 한 단위 크기(size·width)만 받고 나머지 비율은 스스로 잡습니다. 색은 테마 변수를 따라가므로 다크 모드에서 따로 손대지 않습니다."
    >
      <ShowcaseCase
        label="Logo — full"
        description="6곳 — 헤더의 브랜드 링크와 랜딩. 심볼은 원문과 쉬운 자료가 겹친 두 타원"
      >
        <Logo size={24} />
        <Logo size={20} />
        <Logo size={12} />
      </ShowcaseCase>

      <ShowcaseCase
        label="Logo — symbol-only"
        description="좁은 바에서 이름을 떼고 심볼만 — BrandLink compact, BrandMark"
      >
        <Logo layout="symbol-only" size={26} />
        <Logo layout="symbol-only" size={20} />
      </ShowcaseCase>

      <ShowcaseCase
        label="EmptyIllustration"
        description="6곳 — 빈 목록, 올리기 대기, 만드는 중, 실패, 검토 끝. width 140~180"
        className="items-end gap-6"
      >
        <EmptyIllustration variant="empty" width={140} />
        <EmptyIllustration variant="upload" width={140} />
        <EmptyIllustration variant="generating" width={140} />
        <EmptyIllustration variant="error" width={140} />
        <EmptyIllustration variant="done" width={140} />
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
