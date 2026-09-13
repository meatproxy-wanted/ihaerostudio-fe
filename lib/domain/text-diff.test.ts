import { describe, expect, it } from "vitest";

import { diffWords, extractNumbers, numberChanges } from "./text-diff";

describe("어절 단위 차이", () => {
  it("바뀐 어절만 지움과 넣음으로 표시한다", () => {
    const parts = diffWords(
      "A씨와 B씨는 2022년 3월 1일에 임대차계약을 했어요.",
      "A씨와 B씨는 2022년 3월 1일에 집을 빌리는 약속을 했어요.",
    );

    expect(parts).toEqual([
      { type: "same", text: "A씨와 B씨는 2022년 3월 1일에 " },
      { type: "removed", text: "임대차계약을 " },
      { type: "added", text: "집을 빌리는 약속을 " },
      { type: "same", text: "했어요." },
    ]);
  });

  it("문장부호는 따로 떼어 비교한다", () => {
    expect(diffWords("판단했어요.", "판단했습니다.")).toEqual([
      { type: "removed", text: "판단했어요" },
      { type: "added", text: "판단했습니다" },
      { type: "same", text: "." },
    ]);
  });

  it("같은 문장이면 한 조각이다", () => {
    expect(diffWords("같은 문장이에요.", "같은 문장이에요.")).toEqual([
      { type: "same", text: "같은 문장이에요." },
    ]);
  });
});

describe("숫자 표현 뽑기", () => {
  it("만·억 단위 금액을 원 단위 값으로 읽는다", () => {
    expect(extractNumbers("보증금은 1억 원이고 월세는 50만 원이에요.")).toEqual(
      [
        { kind: "money", text: "1억 원", key: "money:100000000" },
        { kind: "money", text: "50만 원", key: "money:500000" },
      ],
    );
  });

  it("쉼표 금액과 섞인 단위를 같은 값으로 읽는다", () => {
    const keys = ["9,850만 원", "98,500,000원", "9850만원"].map(
      (text) => extractNumbers(text)[0].key,
    );

    expect(new Set(keys)).toEqual(new Set(["money:98500000"]));
    expect(extractNumbers("1억 5,000만 원")[0].key).toBe("money:150000000");
  });

  it("날짜는 표기가 달라도 같은 날로 읽는다", () => {
    expect(extractNumbers("2022년 3월 1일")[0].key).toBe("date:2022-03-01");
    expect(extractNumbers("2022. 3. 1.")[0].key).toBe("date:2022-03-01");
  });

  it("비율과 기간을 읽는다", () => {
    expect(
      extractNumbers("연 12%의 이자를 2년 동안").map((m) => m.key),
    ).toEqual(["percent:12", "period:2년"]);
  });
});

describe("숫자가 바뀌었는지", () => {
  it("금액이 달라지면 빠진 것과 새로 생긴 것을 알려 준다", () => {
    const changes = numberChanges(
      "A씨는 달라고 한 돈 중 150만 원을 받지 못해요.",
      "A씨는 15만 원을 받지 못해요.",
    );

    expect(changes.removed.map((m) => m.text)).toEqual(["150만 원"]);
    expect(changes.added.map((m) => m.text)).toEqual(["15만 원"]);
  });

  it("같은 값을 다르게 쓴 것은 바뀐 것으로 보지 않는다", () => {
    expect(numberChanges("9,850만 원을 줘요.", "98,500,000원을 줘요.")).toEqual(
      { removed: [], added: [] },
    );
  });
});
