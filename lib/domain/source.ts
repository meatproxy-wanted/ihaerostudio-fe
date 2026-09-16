import { z } from "zod";

import { idSchema } from "./common";

/** Where a paragraph sits in the judgment's conventional layout. */
export const sourceBlockSchema = z.enum([
  "header",
  "order",
  "claim-purpose",
  "reasons",
  "footer",
]);
export type SourceBlock = z.infer<typeof sourceBlockSchema>;

export const sourceParagraphSchema = z.object({
  id: idSchema,
  block: sourceBlockSchema,
  kind: z.enum(["heading", "body"]),
  /** Heading depth: 1 = 주문·청구취지·이유, 2 = "1. 기초사실", 3 = "가. …". */
  level: z.number().int().min(1).max(3).nullable(),
  /** PDF page the paragraph came from; null for pasted text. */
  page: z.number().int().positive().nullable(),
  text: z.string(),
});
export type SourceParagraph = z.infer<typeof sourceParagraphSchema>;

export const sourceDocumentSchema = z.object({
  projectId: idSchema,
  paragraphs: z.array(sourceParagraphSchema),
});
export type SourceDocument = z.infer<typeof sourceDocumentSchema>;

/** What a judgment upload may be; the input screen checks before sending. */
export const SOURCE_LIMITS = {
  /** Matches the server, which keeps the whole upload under a 4.5 MB request body. */
  pdfMaxBytes: 4_500_000,
  textMinLength: 100,
  textMaxLength: 100_000,
} as const;

export function isPdfFile(file: { type: string; name: string }): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export const SOURCE_BLOCK_LABELS: Record<SourceBlock, string> = {
  header: "사건 정보",
  order: "주문",
  "claim-purpose": "청구취지",
  reasons: "이유",
  footer: "끝",
};
