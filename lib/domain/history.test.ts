import { describe, expect, it } from "vitest";

import { emptyHistory, record, redo, undo } from "./history";

describe("되돌리기 이력", () => {
  it("되돌리면 직전 값으로 가고, 다시 하면 돌아온다", () => {
    let history = record(emptyHistory<string>(), "처음");
    const undone = undo(history, "두 번째");

    expect(undone?.value).toBe("처음");
    history = undone!.history;

    const redone = redo(history, "처음");
    expect(redone?.value).toBe("두 번째");
  });

  it("되돌릴 것이 없으면 null이다", () => {
    expect(undo(emptyHistory<string>(), "지금")).toBeNull();
    expect(redo(emptyHistory<string>(), "지금")).toBeNull();
  });

  it("새로 고치면 다시 하기 목록이 비워진다", () => {
    let history = record(emptyHistory<number>(), 1);
    history = undo(history, 2)!.history;
    history = record(history, 1);

    expect(history.future).toEqual([]);
  });

  it("최대 50단계까지만 기억한다", () => {
    let history = emptyHistory<number>();
    for (let step = 0; step < 60; step++) history = record(history, step);

    expect(history.past).toHaveLength(50);
    expect(history.past[0]).toBe(10);
  });
});
