import { describe, expect, it } from "vitest";

import { countByStatus, reviewItemStatus, type ReviewItem } from "./review";

function item(patch: Partial<ReviewItem>): ReviewItem {
  return {
    key: "k",
    category: "numbers",
    level: "required",
    title: "금액이 달라 보여요",
    detail: "",
    target: { type: "document" },
    evidence: { text: null, anchors: [], structureValue: null, imageId: null },
    suggestion: null,
    dismissal: null,
    ...patch,
  };
}

describe("점검 항목 상태", () => {
  it("문제없음으로 확인한 항목은 수준과 상관없이 처리한 항목이다", () => {
    const dismissal = { memo: "", at: "2026-09-13T10:00:00.000Z" };

    expect(reviewItemStatus(item({ level: "required", dismissal }))).toBe(
      "handled",
    );
    expect(reviewItemStatus(item({ level: "suggested" }))).toBe("suggested");
  });

  it("남은 확인 필요, 남은 살펴보기, 처리한 항목 수를 센다", () => {
    const dismissal = { memo: "원문과 같아요", at: "2026-09-13T10:00:00.000Z" };

    expect(
      countByStatus([
        item({ key: "a" }),
        item({ key: "b", level: "suggested" }),
        item({ key: "c", level: "suggested" }),
        item({ key: "d", dismissal }),
      ]),
    ).toEqual({ required: 1, suggested: 2, handled: 1 });
  });
});
