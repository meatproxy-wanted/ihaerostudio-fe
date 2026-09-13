import { anchorsEqual, type Anchor } from "./common";
import { sameValue } from "./equality";
import type {
  CaseStructure,
  Claim,
  Decision,
  Finding,
  KeyFact,
  Party,
} from "./structure";

export type StructureList =
  "parties" | "keyFacts" | "claims" | "findings" | "decisions";

/** Lists whose items can move between each other to fix claim/finding mixups. */
export type StatementList = "claims" | "findings" | "decisions";

export interface ItemRef {
  list: StructureList;
  id: string;
}

interface ItemByList {
  parties: Party;
  keyFacts: KeyFact;
  claims: Claim;
  findings: Finding;
  decisions: Decision;
}

type AnyItem = ItemByList[StructureList];

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
  return sameValue(contentOf(before), contentOf(after));
}

export function findItem(
  structure: CaseStructure,
  ref: ItemRef,
): AnyItem | undefined {
  const items: AnyItem[] = structure[ref.list];
  return items.find((item) => item.id === ref.id);
}

function mapItem(
  structure: CaseStructure,
  ref: ItemRef,
  update: (item: AnyItem) => AnyItem,
): CaseStructure {
  const items: AnyItem[] = structure[ref.list];
  return {
    ...structure,
    [ref.list]: items.map((item) => (item.id === ref.id ? update(item) : item)),
  };
}

function withoutClaimLinks(
  findings: Finding[],
  claimIds: Set<string>,
): Finding[] {
  return findings.map((finding) =>
    finding.claimIds.some((id) => claimIds.has(id))
      ? {
          ...finding,
          claimIds: finding.claimIds.filter((id) => !claimIds.has(id)),
        }
      : finding,
  );
}

/** Edits an item. Any edit counts as the producer's check, so flags clear. */
export function updateItem<L extends StructureList>(
  structure: CaseStructure,
  ref: { list: L; id: string },
  patch: Partial<Omit<ItemByList[L], "id" | "flags">>,
): CaseStructure {
  return mapItem(structure, ref, (item) => ({ ...item, ...patch, flags: [] }));
}

export function dismissFlags(
  structure: CaseStructure,
  ref: ItemRef,
): CaseStructure {
  return mapItem(structure, ref, (item) => ({ ...item, flags: [] }));
}

export function updateOverview(
  structure: CaseStructure,
  patch: Partial<CaseStructure["overview"]>,
): CaseStructure {
  return { ...structure, overview: { ...structure.overview, ...patch } };
}

function blankItem<L extends StructureList>(
  list: L,
  id: string,
  options: { partyId?: string },
): ItemByList[L] {
  const base = { id, anchors: [], flags: [] };
  const blanks: { [K in StructureList]: ItemByList[K] } = {
    parties: {
      ...base,
      sourceLabel: "",
      legalStatus: "",
      displayName: "",
      easyRole: "",
    },
    keyFacts: { ...base, kind: "money", label: "", value: "" },
    claims: { ...base, partyId: options.partyId ?? "", text: "" },
    findings: { ...base, text: "", claimIds: [], stance: "none" },
    decisions: { ...base, text: "" },
  };
  return blanks[list];
}

export function addItem<L extends StructureList>(
  structure: CaseStructure,
  list: L,
  id: string,
  options: { partyId?: string } = {},
): CaseStructure {
  const items: AnyItem[] = structure[list];
  return { ...structure, [list]: [...items, blankItem(list, id, options)] };
}

/** Removes an item and anything that would dangle without it. */
export function removeItem(
  structure: CaseStructure,
  ref: ItemRef,
): CaseStructure {
  const items: AnyItem[] = structure[ref.list];
  let next: CaseStructure = {
    ...structure,
    [ref.list]: items.filter((item) => item.id !== ref.id),
  };

  const removedClaims = new Set<string>();
  if (ref.list === "claims") removedClaims.add(ref.id);
  if (ref.list === "parties") {
    for (const claim of structure.claims) {
      if (claim.partyId === ref.id) removedClaims.add(claim.id);
    }
    next = {
      ...next,
      claims: next.claims.filter((claim) => !removedClaims.has(claim.id)),
    };
  }
  if (removedClaims.size > 0) {
    next = {
      ...next,
      findings: withoutClaimLinks(next.findings, removedClaims),
    };
  }
  return next;
}

/**
 * Removes an item and returns how to bring it back onto whatever the
 * structure has become since: only the removed item, the claims removed
 * with a party, and their finding links are restored, at their old places.
 */
export function removeItemWithUndo(
  structure: CaseStructure,
  ref: ItemRef,
): {
  structure: CaseStructure;
  restore: (current: CaseStructure) => CaseStructure;
  removedClaims: number;
} {
  const items: AnyItem[] = structure[ref.list];
  const index = items.findIndex((item) => item.id === ref.id);
  if (index === -1) {
    return { structure, restore: (current) => current, removedClaims: 0 };
  }
  const item = items[index];
  const claims = structure.claims
    .map((claim, claimIndex) => ({ claim, claimIndex }))
    .filter(({ claim }) =>
      ref.list === "claims"
        ? claim.id === ref.id
        : ref.list === "parties" && claim.partyId === ref.id,
    );
  const claimIds = new Set(claims.map(({ claim }) => claim.id));
  const links = structure.findings.flatMap((finding) =>
    finding.claimIds
      .filter((id) => claimIds.has(id))
      .map((claimId) => ({ findingId: finding.id, claimId })),
  );

  const restore = (current: CaseStructure): CaseStructure => {
    let next = current;
    if (ref.list !== "claims") {
      const list: AnyItem[] = next[ref.list];
      if (!list.some((existing) => existing.id === item.id)) {
        const copy = [...list];
        copy.splice(Math.min(index, copy.length), 0, item);
        next = { ...next, [ref.list]: copy };
      }
    }
    const restoredClaims = [...next.claims];
    for (const { claim, claimIndex } of claims) {
      if (restoredClaims.some((existing) => existing.id === claim.id)) continue;
      restoredClaims.splice(
        Math.min(claimIndex, restoredClaims.length),
        0,
        claim,
      );
    }
    next = { ...next, claims: restoredClaims };
    next = {
      ...next,
      findings: next.findings.map((finding) => {
        const missing = links
          .filter(
            (link) =>
              link.findingId === finding.id &&
              !finding.claimIds.includes(link.claimId),
          )
          .map((link) => link.claimId);
        return missing.length > 0
          ? { ...finding, claimIds: [...finding.claimIds, ...missing] }
          : finding;
      }),
    };
    return next;
  };

  return {
    structure: removeItem(structure, ref),
    restore,
    removedClaims: ref.list === "parties" ? claims.length : 0,
  };
}

/**
 * Moves a statement between claims, court findings, and decisions. The text
 * and anchors travel; flags clear because moving is the producer's fix.
 */
export function moveItem(
  structure: CaseStructure,
  from: { list: StatementList; id: string },
  to: { list: StatementList; partyId?: string },
): CaseStructure {
  if (from.list === to.list) return structure;
  const item = findItem(structure, from) as Claim | Finding | Decision;
  if (!item) return structure;

  const carried = { id: item.id, text: item.text, anchors: item.anchors };
  let next = removeItem(structure, from);

  if (to.list === "claims") {
    const claim: Claim = { ...carried, partyId: to.partyId ?? "", flags: [] };
    next = { ...next, claims: [...next.claims, claim] };
  } else if (to.list === "findings") {
    const finding: Finding = {
      ...carried,
      claimIds: [],
      stance: "none",
      flags: [],
    };
    next = { ...next, findings: [...next.findings, finding] };
  } else {
    const decision: Decision = { ...carried, flags: [] };
    next = { ...next, decisions: [...next.decisions, decision] };
  }
  return next;
}

export function addAnchor(
  structure: CaseStructure,
  ref: ItemRef,
  anchor: Anchor,
): CaseStructure {
  return mapItem(structure, ref, (item) =>
    item.anchors.some((existing) => anchorsEqual(existing, anchor))
      ? item
      : { ...item, anchors: [...item.anchors, anchor] },
  );
}

export function removeAnchor(
  structure: CaseStructure,
  ref: ItemRef,
  anchor: Anchor,
): CaseStructure {
  return mapItem(structure, ref, (item) => ({
    ...item,
    anchors: item.anchors.filter((existing) => !anchorsEqual(existing, anchor)),
  }));
}

function allItems(structure: CaseStructure): { ref: ItemRef; item: AnyItem }[] {
  const lists: StructureList[] = [
    "parties",
    "keyFacts",
    "claims",
    "findings",
    "decisions",
  ];
  return lists.flatMap((list) =>
    (structure[list] as AnyItem[]).map((item) => ({
      ref: { list, id: item.id },
      item,
    })),
  );
}

export function countFlags(structure: CaseStructure): number {
  return allItems(structure).reduce(
    (total, { item }) => total + item.flags.length,
    0,
  );
}

export type DraftBlockerCode =
  | "no-parties"
  | "no-decisions"
  | "empty-overview"
  | "empty-text"
  | "claim-without-party"
  | "not-confirmed";

export interface DraftBlocker {
  code: DraftBlockerCode;
  message: string;
  item?: ItemRef;
}

function requiredTexts(ref: ItemRef, item: AnyItem): string[] {
  switch (ref.list) {
    case "parties": {
      const party = item as Party;
      return [party.displayName];
    }
    case "keyFacts": {
      const fact = item as KeyFact;
      return [fact.label, fact.value];
    }
    default:
      return [(item as Claim | Finding | Decision).text];
  }
}

/**
 * What stops the draft from being generated, plus how many AI flags remain
 * (flags only warn; they never block).
 */
export function getDraftReadiness(
  structure: CaseStructure,
  confirmed: boolean,
): { blockers: DraftBlocker[]; flagCount: number } {
  const blockers: DraftBlocker[] = [];

  if (structure.parties.length === 0) {
    blockers.push({
      code: "no-parties",
      message: "등장인물을 1명 이상 넣어 주세요.",
    });
  }
  if (structure.decisions.length === 0) {
    blockers.push({
      code: "no-decisions",
      message: "법원의 최종 결정을 1개 이상 넣어 주세요.",
    });
  }
  const { caseName, court } = structure.overview;
  if (!caseName.trim() || !court.trim()) {
    blockers.push({
      code: "empty-overview",
      message: "사건 정보의 사건명과 법원을 채워 주세요.",
    });
  }

  const partyIds = new Set(structure.parties.map((party) => party.id));
  for (const { ref, item } of allItems(structure)) {
    if (requiredTexts(ref, item).some((text) => !text.trim())) {
      blockers.push({
        code: "empty-text",
        message: "빈 칸이 있어요.",
        item: ref,
      });
    }
    if (ref.list === "claims" && !partyIds.has((item as Claim).partyId)) {
      blockers.push({
        code: "claim-without-party",
        message: "누구의 주장인지 정해 주세요.",
        item: ref,
      });
    }
  }

  if (!confirmed) {
    blockers.push({
      code: "not-confirmed",
      message: "원문과 비교해 확인했다고 체크해 주세요.",
    });
  }

  return { blockers, flagCount: countFlags(structure) };
}
