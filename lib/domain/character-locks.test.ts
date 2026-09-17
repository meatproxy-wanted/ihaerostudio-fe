import { describe, expect, it } from "vitest";

import type { EasyDocument } from "./document";
import { preservesCharacterImages } from "./character-locks";

function document(): EasyDocument {
  const sentence = {
    id: "s",
    text: "설명",
    anchors: [],
    origin: "ai-draft" as const,
    verified: false,
  };
  return {
    projectId: "p",
    title: "자료",
    subtitle: "설명",
    saveRevision: 0,
    contentRevision: 0,
    basedOnStructureRevision: 0,
    basedOnSettingsRevision: 0,
    partyNames: [{ partyId: "a", displayName: "A씨" }],
    sections: [
      {
        kind: "people",
        title: "인물",
        cards: [
          {
            id: "person",
            role: "person",
            partyId: "a",
            imageId: "portrait",
            sentences: [sentence],
          },
        ],
      },
      {
        kind: "decision",
        title: "결정",
        cards: [
          {
            id: "scene",
            role: "decision",
            partyId: null,
            imageId: "scene-image",
            sentences: [{ ...sentence, id: "s2" }],
          },
        ],
      },
      { kind: "reasons", title: "이유", cards: [] },
      { kind: "glossary", title: "용어", cards: [] },
    ],
    images: [
      {
        id: "portrait",
        src: "/portrait.png",
        alt: "인물",
        meaning: "기준",
        source: "library",
      },
      {
        id: "scene-image",
        src: "/scene.png",
        alt: "장면",
        meaning: "상황",
        source: "library",
      },
    ],
    glossary: [],
  };
}

describe("fixed characters", () => {
  it.each(["replace", "delete", "reassign", "pixels"])(
    "blocks %s",
    (change) => {
      const before = document();
      const after = structuredClone(before);
      if (change === "replace")
        after.sections[0].cards[0].imageId = "scene-image";
      if (change === "delete") after.sections[0].cards = [];
      if (change === "reassign") after.sections[0].cards[0].partyId = "b";
      if (change === "pixels") after.images[0].src = "/other.png";
      expect(preservesCharacterImages(before, after)).toBe(false);
    },
  );

  it("allows text, alternative text and scene-image edits", () => {
    const before = document();
    const after = structuredClone(before);
    after.sections[0].cards[0].sentences[0].text = "고친 역할 설명";
    after.images[0].alt = "원문과 대조한 대체텍스트";
    after.sections[1].cards[0].imageId = null;
    expect(preservesCharacterImages(before, after)).toBe(true);
  });
});
