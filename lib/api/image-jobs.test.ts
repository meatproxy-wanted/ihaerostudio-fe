import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpApi } from "./http-client";
import {
  imageJobDetailSchema,
  imageJobStatus,
  type ImageJobDetail,
} from "./image-jobs";
import { createValidatedClient } from "./validated-client";

const summary = {
  jobId: "job-1",
  projectId: "project-1",
  mode: "storyboard4" as const,
  cardIds: ["card-1"],
  status: "running",
  submissionState: "accepted" as const,
  providerJobId: "provider-1",
  workflowAvailable: true,
  createdAt: null,
  preparedAt: 1789700000,
  assetIds: [],
};
const detail: ImageJobDetail = {
  ...summary,
  prompts: [
    {
      nodeId: "4",
      classType: "TextEncodeQwenImageEditPlus",
      role: "positive",
      text: "Characters (expressions): ...\nSituation: ...\nObjects: ...",
    },
    {
      nodeId: "5",
      classType: "TextEncodeQwenImageEditPlus",
      role: "negative",
      text: "",
    },
  ],
  settings: [
    {
      nodeId: "11",
      classType: "KSampler",
      values: { steps: 50, cfg: 4, seed: 123, sampler_name: "euler" },
    },
  ],
  references: [
    {
      imageNumber: 1,
      loadNodeId: "20",
      filename: "portrait.png",
      purpose: "character",
      partyId: "party-1",
      assetId: "portrait-1",
    },
  ],
  designs: [
    {
      cardId: "card-1",
      legacyPrompt: null,
      mainMessage: "A request, not a completed payment.",
      semanticBoundary: "Not a completed payment.",
      alt: "삽화",
      meaning: "요청",
      composition: {
        characters: [
          {
            partyId: "party-1",
            role: "claimant",
            expression: "neutral",
            position: "left",
            action: "points at a document",
          },
        ],
        situation: "An actor considers a request.",
        objects: [{ name: "document", stateAndPosition: "on the table" }],
      },
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("saved image job inspection", () => {
  it("uses the existing bearer token, escaped IDs, GET and no-store only", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ jobs: [summary], nextOffset: 20 }))
      .mockResolvedValueOnce(Response.json(detail));
    vi.stubGlobal("fetch", fetch);
    const token = vi.fn(() => "existing-visitor-token");
    const api = createValidatedClient(
      createHttpApi({ baseUrl: "https://studio.example/", token }),
    );
    const controller = new AbortController();
    expect(
      (
        await api.imageJobs.list(
          "project/a",
          { limit: 20, offset: 0 },
          { signal: controller.signal },
        )
      ).nextOffset,
    ).toBe(20);
    expect(
      await api.imageJobs.get("project/a", "job/b", {
        signal: controller.signal,
      }),
    ).toEqual(detail);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      "https://studio.example/api/studio/projects/project%2Fa/image-jobs?limit=20&offset=0",
      "https://studio.example/api/studio/projects/project%2Fa/image-jobs/job%2Fb",
    ]);
    for (const [, options] of fetch.mock.calls) {
      expect(options).toMatchObject({
        method: "GET",
        cache: "no-store",
        headers: { Authorization: "Bearer existing-visitor-token" },
        signal: controller.signal,
      });
      expect(options.body).toBeUndefined();
    }
    expect(token).toHaveBeenCalledTimes(2);
  });

  it("accepts empty results and library jobs without a Comfy workflow", () => {
    const library = {
      ...detail,
      mode: "library",
      submissionState: "not-applicable",
      workflowAvailable: false,
      providerJobId: null,
      preparedAt: null,
      prompts: [],
      references: [],
      settings: [],
      designs: [],
    };
    expect(imageJobDetailSchema.safeParse(library).success).toBe(true);
    expect(imageJobDetailSchema.parse(detail).prompts[1].text).toBe("");
  });

  it("keeps old jobs with unknown bindings and legacy prompts readable", () => {
    const legacy = {
      ...detail,
      references: [
        {
          imageNumber: 1,
          loadNodeId: "20",
          filename: null,
          purpose: "unknown",
          partyId: null,
          assetId: null,
        },
      ],
      designs: [
        {
          ...detail.designs[0],
          composition: null,
          legacyPrompt: "The original saved LLM prompt.",
        },
      ],
    };
    expect(imageJobDetailSchema.parse(legacy).designs[0].legacyPrompt).toBe(
      "The original saved LLM prompt.",
    );
  });

  it("validates detail responses instead of rendering incomplete payloads", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ ...summary, prompts: [] })),
    );
    const api = createValidatedClient(
      createHttpApi({
        baseUrl: "https://studio.example",
        token: () => "token",
      }),
    );
    await expect(api.imageJobs.get("project-1", "job-1")).rejects.toMatchObject(
      { code: "invalid-response" },
    );
  });

  it("preserves access errors and cancellation without submitting anything", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json(
          { detail: { code: "not_found", message: "잡을 찾을 수 없어요." } },
          { status: 404 },
        ),
      )
      .mockRejectedValueOnce(new DOMException("cancelled", "AbortError"));
    vi.stubGlobal("fetch", fetch);
    const api = createValidatedClient(
      createHttpApi({
        baseUrl: "https://studio.example",
        token: () => "token",
      }),
    );
    await expect(api.imageJobs.get("project-1", "job-1")).rejects.toMatchObject(
      { code: "not-found" },
    );
    await expect(api.imageJobs.list("project-1")).rejects.toMatchObject({
      code: "aborted",
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("labels known states and preserves unrecognized provider states", () => {
    expect(imageJobStatus("submission_unknown")).toBe("접수 불확실");
    expect(imageJobStatus("ready")).toBe("완료");
    expect(imageJobStatus("new-provider-state")).toBe("new-provider-state");
  });
});
