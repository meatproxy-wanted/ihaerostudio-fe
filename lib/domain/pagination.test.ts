import { describe, expect, it } from "vitest";

import { numberPages, paginate } from "./pagination";

describe("쪽 채우기", () => {
  it("한 쪽에 들어가면 한 쪽에 모두 넣는다", () => {
    const pages = paginate(
      [
        { id: "a", height: 100 },
        { id: "b", height: 100 },
      ],
      { pageHeight: 300, gap: 10 },
    );

    expect(pages).toEqual([["a", "b"]]);
  });

  it("남은 높이보다 크면 다음 쪽으로 넘기고 쪼개지 않는다", () => {
    const pages = paginate(
      [
        { id: "a", height: 200 },
        { id: "b", height: 95 },
      ],
      { pageHeight: 300, gap: 10 },
    );

    expect(pages).toEqual([["a"], ["b"]]);
  });

  it("쪽 사이 간격까지 넣어서 계산한다", () => {
    const pages = paginate(
      [
        { id: "a", height: 150 },
        { id: "b", height: 145 },
      ],
      { pageHeight: 300, gap: 10 },
    );

    expect(pages).toEqual([["a"], ["b"]]);
  });

  it("새 쪽에서 시작해야 하는 블록은 앞 쪽에 자리가 있어도 넘긴다", () => {
    const pages = paginate(
      [
        { id: "cover", height: 100 },
        { id: "section-1", height: 40, startsPage: true },
        { id: "card", height: 80 },
      ],
      { pageHeight: 300, gap: 10 },
    );

    expect(pages).toEqual([["cover"], ["section-1", "card"]]);
  });

  it("첫 블록이 새 쪽 시작이어도 빈 쪽을 만들지 않는다", () => {
    expect(
      paginate([{ id: "a", height: 50, startsPage: true }], {
        pageHeight: 300,
        gap: 10,
      }),
    ).toEqual([["a"]]);
  });

  it("한 쪽보다 큰 블록은 그 쪽에 혼자 두고 다음 블록은 새 쪽에 둔다", () => {
    const pages = paginate(
      [
        { id: "a", height: 50 },
        { id: "huge", height: 400 },
        { id: "b", height: 50 },
      ],
      { pageHeight: 300, gap: 10 },
    );

    expect(pages).toEqual([["a"], ["huge"], ["b"]]);
  });

  it("구획 제목은 첫 카드와 같은 쪽에 붙어 있도록 제목만 남기지 않는다", () => {
    const pages = paginate(
      [
        { id: "card-1", height: 200 },
        { id: "heading", height: 40, keepWithNext: true },
        { id: "card-2", height: 200 },
      ],
      { pageHeight: 300, gap: 10 },
    );

    expect(pages).toEqual([["card-1"], ["heading", "card-2"]]);
  });
});

describe("쪽 번호", () => {
  it("표지를 1쪽으로 세고 모든 쪽에 전체 쪽 수를 함께 붙인다", () => {
    const pages = numberPages([["cover"], ["section-1", "card"], ["term"]]);

    expect(pages).toEqual([
      { number: 1, label: "1 / 3", blockIds: ["cover"] },
      { number: 2, label: "2 / 3", blockIds: ["section-1", "card"] },
      { number: 3, label: "3 / 3", blockIds: ["term"] },
    ]);
  });
});
