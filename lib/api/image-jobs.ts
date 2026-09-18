import { z } from "zod";

export const sceneCompositionSchema = z.object({
  characters: z.array(
    z.object({
      partyId: z.string().nullable(),
      role: z.string(),
      expression: z.string(),
      position: z.string(),
      action: z.string(),
    }),
  ),
  situation: z.string(),
  objects: z.array(
    z.object({ name: z.string(), stateAndPosition: z.string() }),
  ),
});

export const imageJobSummarySchema = z.object({
  jobId: z.string(),
  projectId: z.string(),
  mode: z.enum(["single", "storyboard4", "library"]),
  cardIds: z.array(z.string()),
  status: z.string(),
  submissionState: z.enum([
    "not-submitted",
    "uncertain",
    "accepted",
    "not-applicable",
  ]),
  providerJobId: z.string().nullable(),
  workflowAvailable: z.boolean(),
  createdAt: z.number().nullable(),
  preparedAt: z.number().nullable(),
  assetIds: z.array(z.string()),
});

export const imageJobListSchema = z.object({
  jobs: z.array(imageJobSummarySchema),
  nextOffset: z.number().int().nonnegative().nullable(),
});

export const imageJobDetailSchema = imageJobSummarySchema.extend({
  prompts: z.array(
    z.object({
      nodeId: z.string(),
      classType: z.string(),
      role: z.enum(["positive", "negative", "other"]),
      text: z.string(),
    }),
  ),
  settings: z.array(
    z.object({
      nodeId: z.string(),
      classType: z.string(),
      values: z.record(
        z.string(),
        z.union([z.string(), z.number(), z.boolean()]),
      ),
    }),
  ),
  references: z.array(
    z.object({
      imageNumber: z.number().int().positive(),
      loadNodeId: z.string(),
      filename: z.string().nullable(),
      purpose: z.enum(["character", "mood", "unknown"]),
      partyId: z.string().nullable(),
      assetId: z.string().nullable(),
    }),
  ),
  designs: z.array(
    z.object({
      cardId: z.string(),
      composition: sceneCompositionSchema.nullable(),
      legacyPrompt: z.string().nullable(),
      mainMessage: z.string().nullable(),
      semanticBoundary: z.string().nullable(),
      alt: z.string().nullable(),
      meaning: z.string().nullable(),
    }),
  ),
});

export type ImageJobSummary = z.infer<typeof imageJobSummarySchema>;
export type ImageJobList = z.infer<typeof imageJobListSchema>;
export type ImageJobDetail = z.infer<typeof imageJobDetailSchema>;

export const IMAGE_JOB_MODES = {
  single: "1컷 생성",
  storyboard4: "4컷 시트",
  library: "고정 캐릭터",
} as const;

export function imageJobStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: "설계 대기",
    planned: "설계 완료",
    prepared: "전송 준비",
    submitting: "접수 확인 중",
    submission_unknown: "접수 불확실",
    queued: "생성 대기",
    running: "생성 중",
    succeeded: "저장 중",
    ready: "완료",
    failed: "실패",
    canceled: "취소",
    expired: "만료",
  };
  return labels[status] ?? status;
}
