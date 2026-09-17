import { afterEach, describe, expect, it, vi } from "vitest";

import { prepareEditorImages } from "./image-preparation";
import type { ImagePreparationResult } from "./types";

const result = (status: "running" | "ready" | "skipped") =>
  ({
    document: {},
    project: {},
    generation: {
      status,
      phase: "portraits",
      completed: 0,
      total: 2,
      currentCardId: "person-1",
    },
  }) as ImagePreparationResult;

afterEach(() => vi.useRealTimers());

describe("automatic editor images", () => {
  it("advances running work then returns the completed server document", async () => {
    vi.useFakeTimers();
    const ready = result("ready");
    const advance = vi
      .fn()
      .mockResolvedValueOnce(result("running"))
      .mockResolvedValueOnce(ready);
    const progress = vi.fn();
    const job = prepareEditorImages(
      advance,
      new AbortController().signal,
      progress,
    );
    await vi.advanceTimersByTimeAsync(2000);
    expect(await job).toBe(ready);
    expect(advance).toHaveBeenCalledTimes(2);
    expect(progress).toHaveBeenCalledTimes(2);
  });

  it("does not repeat skipped demo/without-images work", async () => {
    const advance = vi.fn().mockResolvedValue(result("skipped"));
    await prepareEditorImages(advance, new AbortController().signal, vi.fn());
    expect(advance).toHaveBeenCalledTimes(1);
  });

  it("never automatically retries failed or uncertain submissions", async () => {
    const error = new Error("submission unknown");
    const advance = vi.fn().mockRejectedValue(error);
    await expect(
      prepareEditorImages(advance, new AbortController().signal, vi.fn()),
    ).rejects.toBe(error);
    expect(advance).toHaveBeenCalledTimes(1);
  });

  it("cancels during polling without submitting another card", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const advance = vi.fn().mockResolvedValue(result("running"));
    const job = prepareEditorImages(advance, controller.signal, vi.fn());
    const check = expect(job).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(1);
    controller.abort();
    await check;
    expect(advance).toHaveBeenCalledTimes(1);
  });
});
