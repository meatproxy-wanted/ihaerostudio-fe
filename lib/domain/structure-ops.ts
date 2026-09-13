import type { CaseStructure } from "./structure";

/** The structure without AI flags or bookkeeping, for change detection. */
function contentOf(structure: CaseStructure) {
  const withoutFlags = <T extends { flags: unknown }>(items: T[]) =>
    items.map(({ flags: _flags, ...rest }) => rest);

  return {
    overview: structure.overview,
    parties: withoutFlags(structure.parties),
    keyFacts: withoutFlags(structure.keyFacts),
    claims: withoutFlags(structure.claims),
    findings: withoutFlags(structure.findings),
    decisions: withoutFlags(structure.decisions),
  };
}

/**
 * Dismissing an AI flag is not a structure change: it must not make the draft
 * look outdated.
 */
export function isSameStructureContent(
  before: CaseStructure,
  after: CaseStructure,
): boolean {
  return JSON.stringify(contentOf(before)) === JSON.stringify(contentOf(after));
}
