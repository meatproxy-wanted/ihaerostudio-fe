import { describe, expect, it } from "vitest";

import { segmentText } from "./segments";

describe("문단을 근거 범위로 나누기", () => {
  it("범위가 없으면 문단 전체가 한 조각이다", () => {
    expect(segmentText("원고는 집을 빌렸다.", [])).toEqual([
      { start: 0, end: 11, text: "원고는 집을 빌렸다.", keys: [] },
    ]);
  });

  it("범위 앞뒤를 나눠 범위에 속한 조각에만 키를 붙인다", () => {
    const segments = segmentText("피고는 돈을 돌려주지 않았다.", [
      { start: 4, end: 6, key: "s1" },
    ]);

    expect(segments.map((segment) => [segment.text, segment.keys])).toEqual([
      ["피고는 ", []],
      ["돈을", ["s1"]],
      [" 돌려주지 않았다.", []],
    ]);
  });

  it("겹치는 범위는 겹친 조각에 두 키를 모두 붙인다", () => {
    const segments = segmentText("0123456789", [
      { start: 2, end: 6, key: "a" },
      { start: 4, end: 8, key: "b" },
    ]);

    expect(segments.map((segment) => [segment.text, segment.keys])).toEqual([
      ["01", []],
      ["23", ["a"]],
      ["45", ["a", "b"]],
      ["67", ["b"]],
      ["89", []],
    ]);
  });

  it("문단 밖으로 나간 범위는 문단 길이에 맞춰 자른다", () => {
    const segments = segmentText("짧은 글", [{ start: 3, end: 99, key: "x" }]);

    expect(segments.at(-1)).toEqual({
      start: 3,
      end: 4,
      text: "글",
      keys: ["x"],
    });
  });

  it("같은 키가 두 번 들어와도 조각에는 한 번만 붙인다", () => {
    const segments = segmentText("abcdef", [
      { start: 0, end: 3, key: "k" },
      { start: 1, end: 2, key: "k" },
    ]);

    expect(segments[1].keys).toEqual(["k"]);
  });
});
