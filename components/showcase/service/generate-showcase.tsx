"use client";

import { useState } from "react";

import GenerateButton from "@/components/ui/GenerateButton";
import { ShowcaseCase, ShowcaseSection } from "../showcase-section";

/** 누르면 잠깐 생성 중 상태를 보여 주는 데모용 버튼. */
function DemoGenerateButton() {
  const [loading, setLoading] = useState(false);
  return (
    <GenerateButton
      hug
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2400);
      }}
    >
      눌러서 생성 중 보기
    </GenerateButton>
  );
}

export function GenerateShowcase() {
  return (
    <ShowcaseSection
      id="generate-button"
      title="Generate Button"
      description="AI 생성 액션 하나에만 쓰는 전용 버튼입니다. 파란 그라데이션과 회전하는 빛 테두리로 다른 버튼과 구분합니다. 일반 액션에는 쓰지 않습니다."
    >
      <ShowcaseCase
        label="Default"
        description="W280 고정 · 영문 라벨처럼 길이가 일정할 때"
      >
        <GenerateButton>Generate</GenerateButton>
      </ShowcaseCase>

      <ShowcaseCase
        label="Hug"
        description="라벨 길이에 맞춰 늘어남 · 한글 라벨은 이쪽"
      >
        <GenerateButton hug>AI 분석 시작하기</GenerateButton>
        <GenerateButton hug>초안 만들기</GenerateButton>
        <GenerateButton hug>초안 다시 만들기</GenerateButton>
      </ShowcaseCase>

      <ShowcaseCase
        label="Loading"
        description="생성 중에는 아이콘이 맥동하고 클릭이 막힘"
      >
        <GenerateButton hug loading>
          분석하고 있어요…
        </GenerateButton>
        <DemoGenerateButton />
      </ShowcaseCase>

      <ShowcaseCase label="Disabled" description="조건을 아직 못 갖췄을 때">
        <GenerateButton hug disabled>
          초안 만들기
        </GenerateButton>
      </ShowcaseCase>

      <ShowcaseCase label="Custom icon" description="기본 ✦ 대신 다른 기호">
        <GenerateButton hug icon="✧">
          그림 다시 만들기
        </GenerateButton>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
