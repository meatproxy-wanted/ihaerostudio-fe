import { describe, expect, it } from "vitest";

import type { ReaderContent } from "./publication";
import { formatKoreanDate, readingPages } from "./reading";

function content(overrides: Partial<ReaderContent> = {}): ReaderContent {
  const card = {
    id: "c1",
    role: "decision" as const,
    partyName: null,
    image: null,
    sentences: [{ id: "s1", text: "법원이 정했어요." }],
  };
  return {
    title: "제목",
    subtitle: "부제",
    tone: "haeyo",
    overview: {
      caseName: "사건",
      caseNumber: "2024가단1",
      court: "가온지방법원",
      decisionDate: "2024-06-12",
    },
    sections: [
      { kind: "people", title: "누가 나오나요?", cards: [card] },
      { kind: "decision", title: "무엇을 결정했나요?", cards: [card] },
      { kind: "reasons", title: "왜 그렇게 결정했나요?", cards: [card] },
      { kind: "glossary", title: "어려운 말 풀이", cards: [] },
    ],
    glossary: [{ id: "t1", term: "보증금", explanation: "맡기는 돈이에요." }],
    ...overrides,
  };
}

describe("읽기 순서", () => {
  it("표지, 네 구획, 마침 순서다", () => {
    expect(readingPages(content()).map((page) => page.type)).toEqual([
      "cover",
      "section",
      "section",
      "section",
      "section",
      "end",
    ]);
  });

  it("구획 번호는 1부터 차례로 붙는다", () => {
    const sections = readingPages(content()).filter(
      (page) => page.type === "section",
    );

    expect(sections.map((page) => page.number)).toEqual([1, 2, 3, 4]);
  });

  it("카드가 없는 구획과 풀이가 없는 풀이 구획은 건너뛰고 번호를 당긴다", () => {
    const pages = readingPages(
      content({
        sections: [
          { kind: "people", title: "누가", cards: [] },
          ...content().sections.slice(1),
        ],
        glossary: [],
      }),
    );

    expect(
      pages
        .filter((page) => page.type === "section")
        .map((page) => [page.sectionIndex, page.number]),
    ).toEqual([
      [1, 1],
      [2, 2],
    ]);
  });
});

describe("날짜 표기", () => {
  it("YYYY-MM-DD를 한국어 날짜로 쓴다", () => {
    expect(formatKoreanDate("2024-06-12")).toBe("2024년 6월 12일");
  });

  it("알아볼 수 없는 날짜는 그대로 쓴다", () => {
    expect(formatKoreanDate("미정")).toBe("미정");
  });
});
