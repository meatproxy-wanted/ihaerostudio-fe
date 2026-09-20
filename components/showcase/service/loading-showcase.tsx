"use client";

import { useEffect, useState } from "react";

import GenerationLoading, {
  GenerationLoadingInline,
  type GenerationStage,
} from "@/components/ui/GenerationLoading";
import { Button } from "@/components/ui/button";
import { ShowcaseCase, ShowcaseSection } from "../showcase-section";

const STAGES: { key: GenerationStage; label: string }[] = [
  { key: "reading", label: "판결문 읽기" },
  { key: "structure", label: "사건 구조" },
  { key: "rewrite", label: "쉬운 문장" },
  { key: "illustrate", label: "그림" },
  { key: "done", label: "완료" },
];

/** 단계마다 보여 줄 만한 처리량. 실제로는 그림 단계만 서버가 세어 준다. */
const COUNTS: Partial<
  Record<GenerationStage, { current: number; total: number }>
> = {
  rewrite: { current: 18, total: 42 },
  illustrate: { current: 6, total: 14 },
};

/**
 * The generation screen runs for as long as the server takes, which against
 * a demo provider is a second or two — not long enough to look at. Here it
 * is held still on whichever stage you pick, or walked end to end.
 */
export function LoadingShowcase() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stage = STAGES[index].key;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIndex((previous) => (previous + 1) % STAGES.length);
    }, 2600);
    return () => clearInterval(timer);
  }, [playing]);

  return (
    <ShowcaseSection
      id="loading"
      title="생성 화면"
      description="생성 버튼을 누른 뒤 덮는 화면입니다. 네 단계는 자료 하나가 만들어지는 전 과정이고, 화면마다 그중 일부만 진행해요. 처리량은 그림 단계에서만 서버가 실제로 세어 줍니다."
    >
      <ShowcaseCase
        label="Stage"
        description="눌러서 단계를 고정하거나, 재생으로 전 과정을 한 바퀴"
        actions={
          <Button
            size="xs"
            variant={playing ? "secondary" : "ghost"}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? "멈추기" : "재생"}
          </Button>
        }
      >
        {STAGES.map((entry, position) => (
          <Button
            key={entry.key}
            size="sm"
            variant={stage === entry.key ? "secondary" : "ghost"}
            onClick={() => {
              setPlaying(false);
              setIndex(position);
            }}
          >
            {entry.label}
          </Button>
        ))}
      </ShowcaseCase>

      <ShowcaseCase
        label="Full"
        description="실제로는 화면 전체를 덮음 · 여기서는 액자 안에"
        className="block p-0 pt-0 pb-0"
      >
        <div className="overflow-hidden rounded-b-xl">
          <GenerationLoading
            stage={stage}
            count={COUNTS[stage]}
            eta={stage === "done" ? undefined : "약 1분 남음"}
            documentLabel="2024가단10234"
          />
        </div>
      </ShowcaseCase>

      <ShowcaseCase
        label="Inline"
        description="목록 안에서 쓰는 축약형 · 화면을 덮지 않음"
        className="block"
      >
        <GenerationLoadingInline
          stage={stage === "done" ? "illustrate" : stage}
          count={COUNTS[stage]}
          eta="약 1분 남음"
        />
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
