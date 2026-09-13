import { describe, expect, it } from "vitest";

import type { Card, EasyDocument, Sentence } from "./document";
import { countTouchedSentences } from "./document-ops";

function sentence(id: string, patch: Partial<Sentence> = {}): Sentence {
  return {
    id,
    text: `${id} 문장이에요.`,
    anchors: [],
    origin: "ai-draft",
    verified: false,
    ...patch,
  };
}

function card(id: string, sentences: Sentence[]): Card {
  return { id, role: "background", partyId: null, imageId: null, sentences };
}

function makeDocument(cards: Card[]): EasyDocument {
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
      { kind: "people", title: "누가", cards: [] },
      { kind: "decision", title: "무엇", cards },
      { kind: "reasons", title: "왜", cards: [] },
      { kind: "glossary", title: "풀이", cards: [] },
    ],
    glossary: [],
    images: [],
  };
}

describe("초안을 다시 만들면 사라질 손본 문장", () => {
  it("AI 초안 그대로이고 대조하지 않은 문장은 세지 않는다", () => {
    const document = makeDocument([card("c1", [sentence("a"), sentence("b")])]);

    expect(countTouchedSentences(document)).toBe(0);
  });

  it("직접 고쳤거나, AI 수정안을 적용했거나, 대조한 문장을 센다", () => {
    const document = makeDocument([
      card("c1", [
        sentence("a", { origin: "manual", verified: true }),
        sentence("b", { origin: "ai-suggestion" }),
        sentence("c", { verified: true }),
        sentence("d"),
      ]),
    ]);

    expect(countTouchedSentences(document)).toBe(3);
  });
});
