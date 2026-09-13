import { z } from "zod";

import {
  idSchema,
  isoDateTimeSchema,
  revisionSchema,
  toneSchema,
} from "./common";
import { cardRoleSchema, sectionKindSchema } from "./document";
import { caseOverviewSchema } from "./structure";

/**
 * The reader-visible projection of a document. It carries no anchors,
 * verification marks, or origins, so production data never reaches readers.
 */
export const readerCardSchema = z.object({
  id: idSchema,
  role: cardRoleSchema,
  partyName: z.string().nullable(),
  image: z.object({ src: z.string(), alt: z.string() }).nullable(),
  sentences: z.array(z.object({ id: idSchema, text: z.string() })),
});
export type ReaderCard = z.infer<typeof readerCardSchema>;

export const readerSectionSchema = z.object({
  kind: sectionKindSchema,
  title: z.string(),
  cards: z.array(readerCardSchema),
});
export type ReaderSection = z.infer<typeof readerSectionSchema>;

export const readerContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  tone: toneSchema,
  overview: caseOverviewSchema,
  sections: z.array(readerSectionSchema),
  glossary: z.array(
    z.object({ id: idSchema, term: z.string(), explanation: z.string() }),
  ),
});
export type ReaderContent = z.infer<typeof readerContentSchema>;

export const publicationSummarySchema = z.object({
  id: idSchema,
  projectId: idSchema,
  version: z.number().int().positive(),
  createdAt: isoDateTimeSchema,
  contentRevision: revisionSchema,
  /** Whether review was complete for this content when it was published. */
  reviewed: z.boolean(),
});
export type PublicationSummary = z.infer<typeof publicationSummarySchema>;

export const publicationSchema = publicationSummarySchema.extend({
  content: readerContentSchema,
});
export type Publication = z.infer<typeof publicationSchema>;

export const publicReadingSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("available"), publication: publicationSchema }),
  z.object({ status: z.literal("unavailable") }),
]);
export type PublicReading = z.infer<typeof publicReadingSchema>;
