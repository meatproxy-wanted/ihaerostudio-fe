import { describe, expect, it } from "vitest";

import type { Card, DocImage, EasyDocument, Sentence } from "./document";
import {
  addAnchorToSentence,
  addCard,
  addTerm,
  applySplit,
  applySuggestion,
  countTouchedSentences,
  editSentenceText,
  findSentence,
  findTermRanges,
  glossaryInReadingOrder,
  insertSentenceAfter,
  moveCard,
  moveSentence,
  neighborSentenceId,
  removeAnchorFromSentence,
  removeCard,
  removeSentence,
  removeTerm,
  setCardImage,
  setVerified,
  updateImageText,
  verificationProgress,
} from "./document-ops";

const anchor = { paragraphId: "s-09", start: 3, end: 12 };

function sentence(id: string, patch: Partial<Sentence> = {}): Sentence {
  return {
    id,
    text: `${id} 문장이에요.`,
    anchors: [anchor],
    origin: "ai-draft",
    verified: false,
    ...patch,
  };
}

function card(
  id: string,
  sentences: Sentence[],
  patch: Partial<Card> = {},
): Card {
  return {
    id,
    role: "background",
    partyId: null,
    imageId: null,
    sentences,
    ...patch,
  };
}

const image: DocImage = {
  id: "img-1",
  src: "/one.svg",
  alt: "하나",
  meaning: "첫 그림",
  source: "library",
};

function makeDocument(): EasyDocument {
  return {
    projectId: "p1",
    title: "제목",
    subtitle: "부제",
    saveRevision: 1,
    contentRevision: 1,
    basedOnStructureRevision: 1,
    basedOnSettingsRevision: 0,
    partyNames: [],
    sections: [
      {
        kind: "people",
        title: "누가 나오나요?",
        cards: [
          card("c1", [sentence("a"), sentence("b")], { imageId: "img-1" }),
        ],
      },
      {
        kind: "decision",
        title: "무엇을 결정했나요?",
        cards: [card("c2", [sentence("c")]), card("c3", [sentence("d")])],
      },
      { kind: "reasons", title: "왜?", cards: [] },
      { kind: "glossary", title: "어려운 말", cards: [] },
    ],
    glossary: [
      { id: "t-deposit", term: "보증금", explanation: "맡기는 돈이에요." },
    ],
    images: [image],
  };
}

describe("문장 고치기", () => {
  it("직접 고친 문장은 직접 작성으로 바뀌고 대조한 것으로 본다", () => {
    const after = editSentenceText(makeDocument(), "a", "A씨는 집을 빌렸어요.");
    const found = findSentence(after, "a")!.sentence;

    expect(found).toMatchObject({
      text: "A씨는 집을 빌렸어요.",
      origin: "manual",
      verified: true,
      anchors: [anchor],
    });
  });

  it("글자가 그대로면 아무것도 바뀌지 않는다", () => {
    const document = makeDocument();

    expect(editSentenceText(document, "a", "a 문장이에요.")).toBe(document);
  });

  it("AI 수정안을 적용하면 근거는 남고 대조 표시는 풀린다", () => {
    const document = setVerified(makeDocument(), "c", true);
    const after = applySuggestion(document, "c", "더 쉬운 문장이에요.");

    expect(findSentence(after, "c")!.sentence).toMatchObject({
      text: "더 쉬운 문장이에요.",
      origin: "ai-suggestion",
      verified: false,
      anchors: [anchor],
    });
  });

  it("문장을 나누면 원래 자리에 새 문장들이 순서대로 들어가고 근거를 이어받는다", () => {
    const after = applySplit(
      makeDocument(),
      "a",
      ["첫 문장이에요.", "둘째 문장이에요."],
      ["a1", "a2"],
    );
    const sentences = after.sections[0].cards[0].sentences;

    expect(sentences.map((item) => item.id)).toEqual(["a1", "a2", "b"]);
    expect(sentences[0]).toMatchObject({
      text: "첫 문장이에요.",
      origin: "ai-suggestion",
      verified: false,
      anchors: [anchor],
    });
    expect(sentences[1].anchors).toEqual([anchor]);
  });

  it("대조 표시를 켜고 끌 수 있다", () => {
    const after = setVerified(makeDocument(), "b", true);

    expect(findSentence(after, "b")!.sentence.verified).toBe(true);
    expect(verificationProgress(after)).toEqual({ verified: 1, total: 4 });
  });
});

describe("문장과 카드 편집", () => {
  it("문장 아래에 빈 문장을 넣는다", () => {
    const after = insertSentenceAfter(makeDocument(), "a", "new");

    expect(after.sections[0].cards[0].sentences.map((item) => item.id)).toEqual(
      ["a", "new", "b"],
    );
    expect(findSentence(after, "new")!.sentence).toMatchObject({
      text: "",
      anchors: [],
      origin: "manual",
    });
  });

  it("카드의 마지막 문장은 지우지 않는다", () => {
    const document = makeDocument();

    expect(removeSentence(document, "c")).toBe(document);
    expect(
      removeSentence(document, "a").sections[0].cards[0].sentences,
    ).toHaveLength(1);
  });

  it("문장은 같은 카드 안에서만 옮기고, 끝에서는 그대로다", () => {
    const moved = moveSentence(makeDocument(), "b", -1);
    const document = makeDocument();

    expect(moved.sections[0].cards[0].sentences.map((item) => item.id)).toEqual(
      ["b", "a"],
    );
    expect(moveSentence(document, "a", -1)).toBe(document);
    expect(moveSentence(document, "b", 1)).toBe(document);
  });

  it("카드를 추가하면 빈 문장 하나로 시작한다", () => {
    const after = addCard(makeDocument(), {
      section: "reasons",
      cardId: "c9",
      sentenceId: "s9",
      role: "claim",
      partyId: "party-a",
    });

    expect(after.sections[2].cards).toEqual([
      {
        id: "c9",
        role: "claim",
        partyId: "party-a",
        imageId: null,
        sentences: [
          { id: "s9", text: "", anchors: [], origin: "manual", verified: true },
        ],
      },
    ]);
  });

  it("카드를 지우면 그 카드만 쓰던 그림도 지운다", () => {
    const after = removeCard(makeDocument(), "c1");

    expect(after.sections[0].cards).toEqual([]);
    expect(after.images).toEqual([]);
  });

  it("카드는 같은 구획 안에서 옮긴다", () => {
    const after = moveCard(makeDocument(), "c3", -1);

    expect(after.sections[1].cards.map((item) => item.id)).toEqual([
      "c3",
      "c2",
    ]);
  });

  it("카드는 구획의 처음과 끝에서 더 옮기지 않고 다른 구획으로 넘어가지 않는다", () => {
    const document = makeDocument();

    expect(moveCard(document, "c2", -1)).toBe(document);
    expect(moveCard(document, "c3", 1)).toBe(document);
    expect(moveCard(document, "c1", 1)).toBe(document);
  });
});

describe("그림", () => {
  it("그림을 바꾸면 새 그림을 붙이고 쓰지 않는 옛 그림은 지운다", () => {
    const next: DocImage = { ...image, id: "img-2", src: "/two.svg" };
    const after = setCardImage(makeDocument(), "c1", next);

    expect(after.sections[0].cards[0].imageId).toBe("img-2");
    expect(after.images).toEqual([next]);
  });

  it("그림을 빼면 카드에 그림이 없다", () => {
    const after = setCardImage(makeDocument(), "c1", null);

    expect(after.sections[0].cards[0].imageId).toBeNull();
    expect(after.images).toEqual([]);
  });

  it("대체텍스트와 의미 설명을 고친다", () => {
    const after = updateImageText(makeDocument(), "img-1", {
      alt: "집 앞에 선 사람",
    });

    expect(after.images[0]).toMatchObject({
      alt: "집 앞에 선 사람",
      meaning: "첫 그림",
    });
  });
});

describe("근거", () => {
  it("같은 근거는 한 번만 붙고, 뺄 수 있다", () => {
    const added = addAnchorToSentence(makeDocument(), "c", {
      paragraphId: "s-10",
      start: 0,
      end: 4,
    });
    const twice = addAnchorToSentence(added, "c", {
      paragraphId: "s-10",
      start: 0,
      end: 4,
    });
    const removed = removeAnchorFromSentence(twice, "c", anchor);

    expect(findSentence(twice, "c")!.sentence.anchors).toHaveLength(2);
    expect(findSentence(removed, "c")!.sentence.anchors).toEqual([
      { paragraphId: "s-10", start: 0, end: 4 },
    ]);
  });
});

describe("용어 풀이", () => {
  it("이미 있는 용어를 추가하면 새로 만들지 않고 설명을 바꾼다", () => {
    const after = addTerm(makeDocument(), {
      id: "t-new",
      term: " 보증금 ",
      explanation: "집주인에게 맡기는 돈이에요.",
    });

    expect(after.glossary).toEqual([
      {
        id: "t-deposit",
        term: "보증금",
        explanation: "집주인에게 맡기는 돈이에요.",
      },
    ]);
  });

  it("용어를 지운다", () => {
    expect(removeTerm(makeDocument(), "t-deposit").glossary).toEqual([]);
  });

  it("문장에서 용어 위치를 찾고, 겹치면 긴 용어를 고른다", () => {
    const ranges = findTermRanges("임대차보증금과 보증금은 달라요.", [
      { id: "short", term: "보증금", explanation: "" },
      { id: "long", term: "임대차보증금", explanation: "" },
    ]);

    expect(ranges).toEqual([
      { start: 0, end: 6, termId: "long" },
      { start: 8, end: 11, termId: "short" },
    ]);
  });

  it("풀이는 처음 나오는 순서로 정렬하고, 나오지 않는 용어는 뒤에 표시한다", () => {
    let document = editSentenceText(
      makeDocument(),
      "c",
      "이자와 보증금을 줘요.",
    );
    document = addTerm(document, {
      id: "t-interest",
      term: "이자",
      explanation: "",
    });
    document = addTerm(document, {
      id: "t-unused",
      term: "가집행",
      explanation: "",
    });

    expect(
      glossaryInReadingOrder(document).map((entry) => [
        entry.term.id,
        entry.used,
      ]),
    ).toEqual([
      ["t-interest", true],
      ["t-deposit", true],
      ["t-unused", false],
    ]);
  });
});

describe("읽기 순서 이동과 개수", () => {
  it("구획을 넘어 이전·다음 문장을 찾는다", () => {
    const document = makeDocument();

    expect(neighborSentenceId(document, "b", 1)).toBe("c");
    expect(neighborSentenceId(document, "c", -1)).toBe("b");
    expect(neighborSentenceId(document, "a", -1)).toBeNull();
  });

  it("손본 문장 수는 직접 고침, AI 수정안, 대조한 문장을 센다", () => {
    let document = editSentenceText(makeDocument(), "a", "고친 문장이에요.");
    document = applySuggestion(document, "b", "수정안이에요.");
    document = setVerified(document, "c", true);

    expect(countTouchedSentences(document)).toBe(3);
  });
});
