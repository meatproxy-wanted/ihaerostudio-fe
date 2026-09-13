import { describe, expect, it } from "vitest";

import type { CaseStructure } from "./structure";
import {
  addAnchor,
  addItem,
  countFlags,
  dismissFlags,
  getDraftReadiness,
  isSameStructureContent,
  moveItem,
  removeAnchor,
  removeItem,
  updateItem,
} from "./structure-ops";

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
      {
        id: "party-b",
        sourceLabel: "피고 B",
        legalStatus: "피고",
        displayName: "B씨",
        easyRole: "집주인",
        anchors: [],
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
      {
        id: "claim-2",
        partyId: "party-b",
        text: "새 세입자가 없어 돌려줄 수 없다.",
        anchors: [],
        flags: [],
      },
    ],
    findings: [
      {
        id: "finding-1",
        text: "원고가 바닥을 훼손하였다.",
        claimIds: ["claim-2"],
        stance: "none",
        anchors: [{ paragraphId: "s-28", start: 10, end: 20 }],
        flags: [{ code: "looks-like-claim", message: "확인해 주세요." }],
      },
    ],
    decisions: [
      {
        id: "decision-1",
        text: "피고는 원고에게 돈을 줘라.",
        anchors: [],
        flags: [{ code: "check-ratio", message: "비율을 확인해 주세요." }],
      },
    ],
  };
}

describe("구조 내용이 같은지", () => {
  it("AI 확인 표시를 끈 것만으로는 구조 내용이 바뀌지 않는다", () => {
    const after = dismissFlags(makeStructure(), {
      list: "findings",
      id: "finding-1",
    });

    expect(isSameStructureContent(makeStructure(), after)).toBe(true);
  });

  it("저장된 값과 키 순서만 다르면 같은 내용이다", () => {
    const reordered = JSON.parse(
      JSON.stringify(makeStructure(), (_key, value) =>
        value && typeof value === "object" && !Array.isArray(value)
          ? Object.fromEntries(Object.entries(value).reverse())
          : value,
      ),
    ) as CaseStructure;

    expect(isSameStructureContent(makeStructure(), reordered)).toBe(true);
  });

  it("수정 번호가 달라도 내용이 같으면 같다", () => {
    const after = { ...makeStructure(), revision: 7 };

    expect(isSameStructureContent(makeStructure(), after)).toBe(true);
  });

  it("문구나 근거가 바뀌면 다른 내용이다", () => {
    const textChanged = updateItem(
      makeStructure(),
      { list: "claims", id: "claim-1" },
      { text: "보증금 1억 원을 돌려 달라." },
    );
    const anchorChanged = removeAnchor(
      makeStructure(),
      { list: "parties", id: "party-a" },
      { paragraphId: "s-04", start: 0, end: 4 },
    );

    expect(isSameStructureContent(makeStructure(), textChanged)).toBe(false);
    expect(isSameStructureContent(makeStructure(), anchorChanged)).toBe(false);
  });
});

describe("항목 고치기", () => {
  it("내용을 고치면 그 항목의 AI 확인 표시가 사라진다", () => {
    const after = updateItem(
      makeStructure(),
      { list: "decisions", id: "decision-1" },
      { text: "피고는 원고에게 9,850만 원을 줘라." },
    );

    expect(after.decisions[0].text).toBe("피고는 원고에게 9,850만 원을 줘라.");
    expect(after.decisions[0].flags).toEqual([]);
  });

  it("확인했어요를 누르면 표시만 사라지고 내용은 그대로다", () => {
    const after = dismissFlags(makeStructure(), {
      list: "findings",
      id: "finding-1",
    });

    expect(after.findings[0].flags).toEqual([]);
    expect(after.findings[0].text).toBe("원고가 바닥을 훼손하였다.");
  });

  it("주장을 추가하면 인물이 정해진 빈 주장이 생긴다", () => {
    const after = addItem(makeStructure(), "claims", "claim-new", {
      partyId: "party-b",
    });

    expect(after.claims.at(-1)).toEqual({
      id: "claim-new",
      partyId: "party-b",
      text: "",
      anchors: [],
      flags: [],
    });
  });

  it("주장을 지우면 그 주장을 가리키던 판단의 연결도 지운다", () => {
    const after = removeItem(makeStructure(), {
      list: "claims",
      id: "claim-2",
    });

    expect(after.claims.map((claim) => claim.id)).toEqual(["claim-1"]);
    expect(after.findings[0].claimIds).toEqual([]);
  });

  it("인물을 지우면 그 인물의 주장도 함께 지운다", () => {
    const after = removeItem(makeStructure(), {
      list: "parties",
      id: "party-b",
    });

    expect(after.parties.map((party) => party.id)).toEqual(["party-a"]);
    expect(after.claims.map((claim) => claim.id)).toEqual(["claim-1"]);
    expect(after.findings[0].claimIds).toEqual([]);
  });
});

describe("목록 사이 옮기기", () => {
  it("법원의 판단을 주장으로 옮기면 인물을 붙이고 근거는 남기고 표시는 지운다", () => {
    const after = moveItem(
      makeStructure(),
      { list: "findings", id: "finding-1" },
      { list: "claims", partyId: "party-b" },
    );

    expect(after.findings).toEqual([]);
    expect(after.claims.at(-1)).toEqual({
      id: "finding-1",
      partyId: "party-b",
      text: "원고가 바닥을 훼손하였다.",
      anchors: [{ paragraphId: "s-28", start: 10, end: 20 }],
      flags: [],
    });
  });

  it("주장을 법원의 판단으로 옮기면 다루는 주장 없이 해당 없음으로 시작한다", () => {
    const after = moveItem(
      makeStructure(),
      { list: "claims", id: "claim-1" },
      { list: "findings" },
    );

    expect(after.claims.map((claim) => claim.id)).toEqual(["claim-2"]);
    expect(after.findings.at(-1)).toMatchObject({
      id: "claim-1",
      text: "보증금을 돌려 달라.",
      claimIds: [],
      stance: "none",
    });
  });

  it("주장을 옮기면 다른 판단이 가리키던 연결도 지운다", () => {
    const after = moveItem(
      makeStructure(),
      { list: "claims", id: "claim-2" },
      { list: "decisions" },
    );

    expect(after.findings[0].claimIds).toEqual([]);
    expect(after.decisions.at(-1)).toMatchObject({
      id: "claim-2",
      text: "새 세입자가 없어 돌려줄 수 없다.",
    });
  });

  it("같은 목록으로는 옮기지 않는다", () => {
    const structure = makeStructure();

    expect(
      moveItem(
        structure,
        { list: "claims", id: "claim-1" },
        { list: "claims" },
      ),
    ).toBe(structure);
  });
});

describe("근거", () => {
  it("같은 근거는 두 번 붙지 않는다", () => {
    const anchor = { paragraphId: "s-10", start: 0, end: 5 };
    const once = addAnchor(
      makeStructure(),
      { list: "claims", id: "claim-1" },
      anchor,
    );
    const twice = addAnchor(once, { list: "claims", id: "claim-1" }, anchor);

    expect(twice.claims[0].anchors).toEqual([anchor]);
  });
});

describe("초안 만들기 조건", () => {
  it("확인 체크를 하고 빈 칸이 없으면 막는 조건이 없다", () => {
    const readiness = getDraftReadiness(makeStructure(), true);

    expect(readiness.blockers).toEqual([]);
    expect(readiness.flagCount).toBe(2);
  });

  it("원문과 비교했다는 체크가 없으면 막는다", () => {
    const readiness = getDraftReadiness(makeStructure(), false);

    expect(readiness.blockers.map((blocker) => blocker.code)).toEqual([
      "not-confirmed",
    ]);
  });

  it("인물이나 최종 결정이 없으면 막는다", () => {
    const structure = {
      ...makeStructure(),
      parties: [],
      claims: [],
      decisions: [],
    };

    expect(
      getDraftReadiness(structure, true).blockers.map(
        (blocker) => blocker.code,
      ),
    ).toEqual(["no-parties", "no-decisions"]);
  });

  it("인물이 없는 주장과 빈 문구를 항목과 함께 알려 준다", () => {
    let structure = updateItem(
      makeStructure(),
      { list: "claims", id: "claim-1" },
      { text: "  " },
    );
    structure = {
      ...structure,
      claims: structure.claims.map((claim) =>
        claim.id === "claim-2" ? { ...claim, partyId: "party-gone" } : claim,
      ),
    };

    const blockers = getDraftReadiness(structure, true).blockers;

    expect(blockers).toContainEqual(
      expect.objectContaining({
        code: "empty-text",
        item: { list: "claims", id: "claim-1" },
      }),
    );
    expect(blockers).toContainEqual(
      expect.objectContaining({
        code: "claim-without-party",
        item: { list: "claims", id: "claim-2" },
      }),
    );
  });

  it("AI 확인 표시 수를 센다", () => {
    expect(countFlags(makeStructure())).toBe(2);
  });
});
