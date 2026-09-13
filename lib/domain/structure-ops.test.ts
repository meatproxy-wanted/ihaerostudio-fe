import { describe, expect, it } from "vitest";

import { isSameStructureContent } from "./structure-ops";
import type { CaseStructure } from "./structure";

function makeStructure(): CaseStructure {
  return {
    projectId: "p1",
    revision: 1,
    overview: {
      caseName: "임대차보증금 반환",
      caseNumber: "2024가단10234",
      court: "가온지방법원",
      decisionDate: "2024-06-12",
    },
    parties: [
      {
        id: "party-a",
        sourceLabel: "원고 A",
        legalStatus: "원고",
        displayName: "A씨",
        easyRole: "집을 빌린 사람",
        anchors: [{ paragraphId: "s-04", start: 0, end: 4 }],
        flags: [],
      },
    ],
    keyFacts: [],
    claims: [
      {
        id: "claim-1",
        partyId: "party-a",
        text: "보증금을 돌려 달라.",
        anchors: [],
        flags: [],
      },
    ],
    findings: [
      {
        id: "finding-1",
        text: "원고가 바닥을 훼손하였다.",
        claimIds: [],
        stance: "none",
        anchors: [],
        flags: [{ code: "looks-like-claim", message: "확인해 주세요." }],
      },
    ],
    decisions: [],
  };
}

describe("구조 내용이 같은지", () => {
  it("AI 확인 표시를 끈 것만으로는 구조 내용이 바뀌지 않는다", () => {
    const after = makeStructure();
    after.findings[0].flags = [];

    expect(isSameStructureContent(makeStructure(), after)).toBe(true);
  });

  it("수정 번호가 달라도 내용이 같으면 같다", () => {
    const after = makeStructure();
    after.revision = 7;

    expect(isSameStructureContent(makeStructure(), after)).toBe(true);
  });

  it("문구나 근거가 바뀌면 다른 내용이다", () => {
    const textChanged = makeStructure();
    textChanged.claims[0].text = "보증금 1억 원을 돌려 달라.";
    const anchorChanged = makeStructure();
    anchorChanged.parties[0].anchors = [];

    expect(isSameStructureContent(makeStructure(), textChanged)).toBe(false);
    expect(isSameStructureContent(makeStructure(), anchorChanged)).toBe(false);
  });
});
