import { describe, expect, it } from "vitest";

import type { EasyDocument } from "./document";
import { isSameReaderContent, toReaderContent } from "./reader-content";
import type { CaseOverview } from "./structure";

const overview: CaseOverview = {
  caseName: "임대차보증금 반환",
  caseNumber: "2024가단10234",
  court: "가온지방법원",
  decisionDate: "2024-06-12",
};

const context = { overview, tone: "haeyo", illustrations: "with" } as const;

function makeDocument(): EasyDocument {
  return {
    projectId: "p1",
    title: "보증금 재판 결과",
    subtitle: "쉽게 알려 드려요.",
    saveRevision: 3,
    contentRevision: 2,
    basedOnStructureRevision: 1,
    basedOnSettingsRevision: 0,
    partyNames: [
      { partyId: "party-a", displayName: "A씨" },
      { partyId: "party-b", displayName: "B씨" },
    ],
    sections: [
      {
        kind: "people",
        title: "누가 나오나요?",
        cards: [
          {
            id: "card-a",
            role: "person",
            partyId: "party-a",
            imageId: "img-a",
            sentences: [
              {
                id: "s1",
                text: "A씨는 집을 빌렸어요.",
                anchors: [{ paragraphId: "p-1", start: 0, end: 4 }],
                origin: "ai-draft",
                verified: false,
              },
            ],
          },
        ],
      },
      {
        kind: "decision",
        title: "무엇을 결정했나요?",
        cards: [
          {
            id: "card-d",
            role: "decision",
            partyId: null,
            imageId: null,
            sentences: [
              {
                id: "s2",
                text: "B씨는 돈을 돌려줘야 해요.",
                anchors: [],
                origin: "manual",
                verified: true,
              },
            ],
          },
        ],
      },
      {
        kind: "reasons",
        title: "왜 그렇게 결정했나요?",
        cards: [
          {
            id: "card-c",
            role: "claim",
            partyId: "party-b",
            imageId: null,
            sentences: [
              {
                id: "s3",
                text: "B씨는 돌려줄 수 없다고 했어요.",
                anchors: [],
                origin: "ai-suggestion",
                verified: false,
              },
            ],
          },
        ],
      },
      { kind: "glossary", title: "어려운 말 풀이", cards: [] },
    ],
    glossary: [{ id: "t1", term: "보증금", explanation: "맡기는 돈이에요." }],
    images: [
      {
        id: "img-a",
        src: "/a.svg",
        alt: "집과 사람",
        meaning: "세입자",
        source: "library",
      },
    ],
  };
}

describe("독자용 내용 뽑기", () => {
  it("근거, 대조 표시, 출처 같은 제작용 정보는 담지 않는다", () => {
    const content = toReaderContent(makeDocument(), context);
    const sentence = content.sections[0].cards[0].sentences[0];

    expect(sentence).toEqual({ id: "s1", text: "A씨는 집을 빌렸어요." });
    expect(JSON.stringify(content)).not.toMatch(
      /anchors|verified|origin|meaning/,
    );
  });

  it("인물 소개와 주장 카드에는 인물 호칭을, 나머지 카드에는 null을 붙인다", () => {
    const content = toReaderContent(makeDocument(), context);

    expect(content.sections[0].cards[0].partyName).toBe("A씨");
    expect(content.sections[2].cards[0].partyName).toBe("B씨");
    expect(content.sections[1].cards[0].partyName).toBeNull();
  });

  it("그림은 주소와 대체텍스트만 담는다", () => {
    const content = toReaderContent(makeDocument(), context);

    expect(content.sections[0].cards[0].image).toEqual({
      src: "/a.svg",
      alt: "집과 사람",
    });
  });

  it("글만 쓰는 설정이면 그림을 싣지 않는다", () => {
    const content = toReaderContent(makeDocument(), {
      ...context,
      illustrations: "none",
    });

    expect(content.sections[0].cards[0].image).toBeNull();
  });

  it("사건 정보와 문체, 용어 풀이를 함께 담는다", () => {
    const content = toReaderContent(makeDocument(), context);

    expect(content.overview).toEqual(overview);
    expect(content.tone).toBe("haeyo");
    expect(content.glossary).toEqual([
      { id: "t1", term: "보증금", explanation: "맡기는 돈이에요." },
    ]);
  });
});

describe("독자용 용어 풀이 순서", () => {
  it("추가한 순서가 아니라 문장에 처음 나오는 순서로 싣는다", () => {
    const document = makeDocument();
    document.glossary = [
      { id: "t-late", term: "돌려줄", explanation: "주는 거예요." },
      { id: "t-early", term: "집", explanation: "사는 곳이에요." },
    ];

    expect(
      toReaderContent(document, context).glossary.map((term) => term.id),
    ).toEqual(["t-early", "t-late"]);
  });
});

describe("독자용 내용이 같은지", () => {
  it("대조 표시와 근거만 바뀌면 같은 내용이다", () => {
    const before = makeDocument();
    const after = makeDocument();
    after.sections[0].cards[0].sentences[0].verified = true;
    after.sections[0].cards[0].sentences[0].anchors = [];
    after.saveRevision = 9;

    expect(isSameReaderContent(before, after, context)).toBe(true);
  });

  it("문장 텍스트가 바뀌면 다른 내용이다", () => {
    const after = makeDocument();
    after.sections[1].cards[0].sentences[0].text =
      "B씨는 9,850만 원을 줘야 해요.";

    expect(isSameReaderContent(makeDocument(), after, context)).toBe(false);
  });

  it("그림 대체텍스트나 제목, 용어 풀이가 바뀌면 다른 내용이다", () => {
    const altChanged = makeDocument();
    altChanged.images[0].alt = "사람";
    const titleChanged = makeDocument();
    titleChanged.title = "새 제목";
    const glossaryChanged = makeDocument();
    glossaryChanged.glossary[0].explanation = "집주인에게 맡기는 돈이에요.";

    for (const after of [altChanged, titleChanged, glossaryChanged]) {
      expect(isSameReaderContent(makeDocument(), after, context)).toBe(false);
    }
  });

  it("그림의 의미 설명만 바뀌면 같은 내용이다", () => {
    const after = makeDocument();
    after.images[0].meaning = "집을 빌린 사람";

    expect(isSameReaderContent(makeDocument(), after, context)).toBe(true);
  });
});
