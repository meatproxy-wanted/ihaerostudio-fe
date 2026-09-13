import { z } from "zod";

import {
  idSchema,
  isoDateTimeSchema,
  revisionSchema,
  settingsSchema,
} from "./common";

/**
 * Everything the project list and the step bar need, without loading the
 * source, structure, or document themselves.
 */
export const projectSchema = z.object({
  id: idSchema,
  title: z.string(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  settings: settingsSchema,
  settingsRevision: revisionSchema,
  source: z.object({
    kind: z.enum(["pdf", "text"]),
    fileName: z.string().nullable(),
    byteSize: z.number().int().nonnegative().nullable(),
    charCount: z.number().int().nonnegative(),
  }),
  caseNumber: z.string().nullable(),
  structureRevision: revisionSchema,
  document: z
    .object({
      saveRevision: revisionSchema,
      contentRevision: revisionSchema,
      basedOnStructureRevision: revisionSchema,
      basedOnSettingsRevision: revisionSchema,
      sentenceCount: z.number().int().nonnegative(),
      verifiedCount: z.number().int().nonnegative(),
    })
    .nullable(),
  review: z.object({
    /** Content revision of the latest check run; null if never checked. */
    checkedContentRevision: revisionSchema.nullable(),
    openRequiredCount: z.number().int().nonnegative().nullable(),
    completedContentRevision: revisionSchema.nullable(),
    completedAt: isoDateTimeSchema.nullable(),
  }),
  publication: z.object({
    latestVersion: z.number().int().positive().nullable(),
    latestContentRevision: revisionSchema.nullable(),
    publicPublicationId: idSchema.nullable(),
    publicVersion: z.number().int().positive().nullable(),
  }),
});
export type Project = z.infer<typeof projectSchema>;
