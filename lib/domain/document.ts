import { z } from "zod";

import { anchorSchema, idSchema, revisionSchema } from "./common";

/** The fixed reading order of every easy-read document. */
export const SECTION_KINDS = [
  "people",
  "decision",
  "reasons",
  "glossary",
] as const;
export const sectionKindSchema = z.enum(SECTION_KINDS);
export type SectionKind = z.infer<typeof sectionKindSchema>;

/**
 * What a card says. Keeping claims and court findings apart is the card's job,
 * not the sentence's, so the label a reader sees always matches its contents.
 */
export const cardRoleSchema = z.enum([
  "person",
  "background",
  "claim",
  "finding",
  "decision",
]);
export type CardRole = z.infer<typeof cardRoleSchema>;

export const sentenceOriginSchema = z.enum([
  "ai-draft",
  "ai-suggestion",
  "manual",
]);
export type SentenceOrigin = z.infer<typeof sentenceOriginSchema>;

export const sentenceSchema = z.object({
  id: idSchema,
  text: z.string(),
  anchors: z.array(anchorSchema),
  origin: sentenceOriginSchema,
  /** The producer compared this sentence with the source. */
  verified: z.boolean(),
});
export type Sentence = z.infer<typeof sentenceSchema>;

export const cardSchema = z.object({
  id: idSchema,
  role: cardRoleSchema,
  /** The person a `person` or `claim` card is about; null otherwise. */
  partyId: idSchema.nullable(),
  imageId: idSchema.nullable(),
  sentences: z.array(sentenceSchema).min(1),
});
export type Card = z.infer<typeof cardSchema>;

export const sectionSchema = z.object({
  kind: sectionKindSchema,
  title: z.string(),
  /** Always empty for the glossary section, which renders `glossary` instead. */
  cards: z.array(cardSchema),
});
export type Section = z.infer<typeof sectionSchema>;

export const glossaryTermSchema = z.object({
  id: idSchema,
  term: z.string().min(1),
  explanation: z.string(),
});
export type GlossaryTerm = z.infer<typeof glossaryTermSchema>;

export const docImageSchema = z.object({
  id: idSchema,
  src: z.string().min(1),
  alt: z.string(),
  /** What the picture depicts, used to check it against the card's text. */
  meaning: z.string(),
  source: z.enum(["library", "upload"]),
});
export type DocImage = z.infer<typeof docImageSchema>;

export const partyNameSchema = z.object({
  partyId: idSchema,
  displayName: z.string(),
});

export const easyDocumentSchema = z.object({
  projectId: idSchema,
  title: z.string(),
  subtitle: z.string(),
  /** Bumped on every save; orders autosaves. */
  saveRevision: revisionSchema,
  /** Bumped only when reader-visible content changes. */
  contentRevision: revisionSchema,
  basedOnStructureRevision: revisionSchema,
  basedOnSettingsRevision: revisionSchema,
  /** Party names captured when the draft was made, for card labels. */
  partyNames: z.array(partyNameSchema),
  sections: z.array(sectionSchema).length(SECTION_KINDS.length),
  glossary: z.array(glossaryTermSchema),
  images: z.array(docImageSchema),
});
export type EasyDocument = z.infer<typeof easyDocumentSchema>;

export const CARD_ROLE_LABELS: Record<CardRole, string> = {
  person: "인물 소개",
  background: "배경",
  claim: "주장",
  finding: "법원의 판단",
  decision: "최종 결정",
};

/** Card roles a producer may add to each section. */
export const SECTION_CARD_ROLES: Record<SectionKind, CardRole[]> = {
  people: ["person", "background"],
  decision: ["decision"],
  reasons: ["background", "claim", "finding"],
  glossary: [],
};
