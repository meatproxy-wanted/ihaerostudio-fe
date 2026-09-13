import { z } from "zod";

import { aiFlagSchema, anchorSchema, idSchema, revisionSchema } from "./common";

export const caseOverviewSchema = z.object({
  caseName: z.string(),
  caseNumber: z.string(),
  court: z.string(),
  /** Calendar date of the ruling, YYYY-MM-DD. */
  decisionDate: z.string(),
});
export type CaseOverview = z.infer<typeof caseOverviewSchema>;

const itemBase = {
  id: idSchema,
  anchors: z.array(anchorSchema),
  flags: z.array(aiFlagSchema),
};

export const partySchema = z.object({
  ...itemBase,
  /** How the judgment writes the person, e.g. "원고 A". */
  sourceLabel: z.string(),
  /** Legal standing, e.g. "원고". */
  legalStatus: z.string(),
  /** How the easy-read material calls the person, e.g. "A씨". */
  displayName: z.string(),
  /** Plain description of who they are, e.g. "집을 빌린 사람". */
  easyRole: z.string(),
});
export type Party = z.infer<typeof partySchema>;

export const keyFactKindSchema = z.enum(["money", "date", "period", "other"]);
export type KeyFactKind = z.infer<typeof keyFactKindSchema>;

export const keyFactSchema = z.object({
  ...itemBase,
  kind: keyFactKindSchema,
  label: z.string(),
  value: z.string(),
});
export type KeyFact = z.infer<typeof keyFactSchema>;

/** Something a party argued. Never something the court accepted. */
export const claimSchema = z.object({
  ...itemBase,
  partyId: idSchema,
  text: z.string(),
});
export type Claim = z.infer<typeof claimSchema>;

export const findingStanceSchema = z.enum([
  "accepted",
  "rejected",
  "partial",
  "none",
]);
export type FindingStance = z.infer<typeof findingStanceSchema>;

/** What the court recognized or judged on the way to its decision. */
export const findingSchema = z.object({
  ...itemBase,
  text: z.string(),
  claimIds: z.array(idSchema),
  stance: findingStanceSchema,
});
export type Finding = z.infer<typeof findingSchema>;

/** A line of the final order (주문). */
export const decisionSchema = z.object({
  ...itemBase,
  text: z.string(),
});
export type Decision = z.infer<typeof decisionSchema>;

export const caseStructureSchema = z.object({
  projectId: idSchema,
  revision: revisionSchema,
  overview: caseOverviewSchema,
  parties: z.array(partySchema),
  keyFacts: z.array(keyFactSchema),
  claims: z.array(claimSchema),
  findings: z.array(findingSchema),
  decisions: z.array(decisionSchema),
});
export type CaseStructure = z.infer<typeof caseStructureSchema>;

export const KEY_FACT_KIND_LABELS: Record<KeyFactKind, string> = {
  money: "금액",
  date: "날짜",
  period: "기간",
  other: "기타",
};

export const FINDING_STANCE_LABELS: Record<FindingStance, string> = {
  accepted: "받아들임",
  rejected: "받아들이지 않음",
  partial: "일부만 받아들임",
  none: "해당 없음",
};
