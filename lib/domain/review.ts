import { z } from "zod";

import {
  anchorSchema,
  idSchema,
  isoDateTimeSchema,
  revisionSchema,
} from "./common";

export const reviewCategorySchema = z.enum([
  "numbers",
  "relations",
  "claim-mix",
  "image-meaning",
  "no-anchor",
  "structure-changed",
  "hard-term",
  "long-sentence",
  "alt-text",
]);
export type ReviewCategory = z.infer<typeof reviewCategorySchema>;

export const reviewGroupSchema = z.enum(["meaning", "readability", "output"]);
export type ReviewGroup = z.infer<typeof reviewGroupSchema>;

/** `required` must be handled before review can finish; `suggested` never blocks. */
export const reviewLevelSchema = z.enum(["required", "suggested"]);
export type ReviewLevel = z.infer<typeof reviewLevelSchema>;

export const reviewTargetSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("sentence"),
    cardId: idSchema,
    sentenceId: idSchema,
  }),
  z.object({ type: z.literal("card"), cardId: idSchema }),
  z.object({ type: z.literal("image"), cardId: idSchema, imageId: idSchema }),
  z.object({ type: z.literal("term"), termId: idSchema }),
  z.object({ type: z.literal("document") }),
]);
export type ReviewTarget = z.infer<typeof reviewTargetSchema>;

export const reviewItemSchema = z.object({
  /** Stable across runs for the same category, target, and target content. */
  key: z.string().min(1),
  category: reviewCategorySchema,
  level: reviewLevelSchema,
  title: z.string(),
  detail: z.string(),
  target: reviewTargetSchema,
  evidence: z.object({
    /** The easy-read text the item is about, as it was when checked. */
    text: z.string().nullable(),
    anchors: z.array(anchorSchema),
    structureValue: z.string().nullable(),
    imageId: idSchema.nullable(),
  }),
  suggestion: z.object({ text: z.string() }).nullable(),
  dismissal: z.object({ memo: z.string(), at: isoDateTimeSchema }).nullable(),
});
export type ReviewItem = z.infer<typeof reviewItemSchema>;

export const reviewRunSchema = z.object({
  projectId: idSchema,
  contentRevision: revisionSchema,
  ranAt: isoDateTimeSchema,
  items: z.array(reviewItemSchema),
});
export type ReviewRun = z.infer<typeof reviewRunSchema>;

export const checklistKeySchema = z.enum([
  "numbers",
  "relations",
  "images",
  "claims",
]);
export type ChecklistKey = z.infer<typeof checklistKeySchema>;

export const reviewCompletionSchema = z.object({
  contentRevision: revisionSchema,
  completedAt: isoDateTimeSchema,
  checklist: z.array(checklistKeySchema),
});
export type ReviewCompletion = z.infer<typeof reviewCompletionSchema>;

export const REVIEW_CATEGORY_GROUP: Record<ReviewCategory, ReviewGroup> = {
  numbers: "meaning",
  relations: "meaning",
  "claim-mix": "meaning",
  "image-meaning": "meaning",
  "no-anchor": "meaning",
  "structure-changed": "meaning",
  "hard-term": "readability",
  "long-sentence": "readability",
  "alt-text": "output",
};

export const REVIEW_GROUP_LABELS: Record<ReviewGroup, string> = {
  meaning: "뜻이 달라졌나요",
  readability: "더 쉽게 읽히나요",
  output: "결과물 준비",
};

export const REVIEW_CATEGORY_LABELS: Record<ReviewCategory, string> = {
  numbers: "숫자·날짜",
  relations: "인물 관계",
  "claim-mix": "주장·판단 섞임",
  "image-meaning": "글·그림 뜻",
  "no-anchor": "원문 근거 없음",
  "structure-changed": "구조 변경",
  "hard-term": "어려운 말",
  "long-sentence": "긴 문장",
  "alt-text": "대체텍스트",
};

export const CHECKLIST_LABELS: Record<ChecklistKey, string> = {
  numbers: "금액, 날짜, 기간을 원문과 비교했어요.",
  relations: "누가 누구에게 무엇을 하는지 원문과 같아요.",
  images: "그림이 글의 뜻과 맞아요.",
  claims: "당사자의 주장과 법원의 판단·결정이 섞이지 않았어요.",
};

/** The checklist a producer must tick; the image item only applies with pictures. */
export function checklistFor(illustrations: "with" | "none"): ChecklistKey[] {
  return illustrations === "with"
    ? ["numbers", "relations", "images", "claims"]
    : ["numbers", "relations", "claims"];
}
