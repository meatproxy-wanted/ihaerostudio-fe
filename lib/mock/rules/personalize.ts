/*
 * MOCK ONLY — delete with the rest of lib/mock when the real server lands.
 *
 * Fakes how the server would honor the tone and naming settings when it
 * writes the sample structure and draft. These are string rules tuned to the
 * fixture sentences, not a real style converter.
 */
import type { Naming, Settings } from "../../domain/common";
import type { EasyDocument } from "../../domain/document";
import { withParticle, type ParticlePair } from "../../domain/korean";
import type { CaseStructure } from "../../domain/structure";

const DEFAULT_NAMES: Record<Naming, Record<string, string>> = {
  initial: { "party-a": "A씨", "party-b": "B씨" },
  role: { "party-a": "세입자", "party-b": "집주인" },
  legal: { "party-a": "원고", "party-b": "피고" },
};

/** The fixture draft is written with these names. */
const FIXTURE_NAMES: Record<string, string> = DEFAULT_NAMES.initial;

export function defaultPartyName(partyId: string, naming: Naming) {
  return DEFAULT_NAMES[naming][partyId];
}

const PARTICLE_PAIRS: Record<string, ParticlePair> = {
  은: "은/는",
  는: "은/는",
  이: "이/가",
  가: "이/가",
  을: "을/를",
  를: "을/를",
  과: "과/와",
  와: "과/와",
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rename(text: string, from: string, to: string) {
  if (from === to) return text;
  // A particle counts only when it ends the word ("A씨는 " but not "A씨에게").
  return text.replace(
    new RegExp(
      `${escapeRegExp(from)}((?:은|는|이|가|을|를|과|와)(?![가-힣]))?`,
      "g",
    ),
    (_match, particle?: string) =>
      particle ? withParticle(to, PARTICLE_PAIRS[particle]) : to,
  );
}

const HAMNIDA_ENDINGS: [RegExp, string][] = [
  [/봤어요([.?!]?)$/, "보았습니다$1"],
  [/줬어요([.?!]?)$/, "주었습니다$1"],
  [/됐어요([.?!]?)$/, "되었습니다$1"],
  [/했어요([.?!]?)$/, "했습니다$1"],
  [/(었|았|였)어요([.?!]?)$/, "$1습니다$2"],
  [/이에요([.?!]?)$/, "입니다$1"],
  [/예요([.?!]?)$/, "입니다$1"],
  [/드려요([.?!]?)$/, "드립니다$1"],
  [/받아요([.?!]?)$/, "받습니다$1"],
  [/내요([.?!]?)$/, "냅니다$1"],
  [/돼요([.?!]?)$/, "됩니다$1"],
  [/해요([.?!]?)$/, "합니다$1"],
];

function toHamnidaSentence(sentence: string) {
  for (const [pattern, replacement] of HAMNIDA_ENDINGS) {
    if (pattern.test(sentence)) return sentence.replace(pattern, replacement);
  }
  return sentence;
}

export function toHamnida(text: string) {
  return text
    .split(/(?<=[.?!])\s+/)
    .map(toHamnidaSentence)
    .join(" ");
}

export function personalizeStructure(
  structure: CaseStructure,
  settings: Settings,
): CaseStructure {
  return {
    ...structure,
    parties: structure.parties.map((party) => ({
      ...party,
      displayName:
        defaultPartyName(party.id, settings.naming) ?? party.displayName,
    })),
  };
}

export function personalizeDraft(
  document: EasyDocument,
  settings: Settings,
  structure: CaseStructure,
): EasyDocument {
  const names = new Map(
    structure.parties.map((party) => [party.id, party.displayName]),
  );
  const rewrite = (text: string) => {
    let result = text;
    for (const [partyId, fixtureName] of Object.entries(FIXTURE_NAMES)) {
      const name = names.get(partyId);
      if (name) result = rename(result, fixtureName, name);
    }
    return settings.tone === "hamnida" ? toHamnida(result) : result;
  };
  const withPictures = settings.illustrations === "with";

  return {
    ...document,
    subtitle: rewrite(document.subtitle),
    partyNames: structure.parties.map((party) => ({
      partyId: party.id,
      displayName: party.displayName,
    })),
    sections: document.sections.map((section) => ({
      ...section,
      cards: section.cards.map((card) => ({
        ...card,
        imageId: withPictures ? card.imageId : null,
        sentences: card.sentences.map((sentence) => ({
          ...sentence,
          text: rewrite(sentence.text),
        })),
      })),
    })),
    glossary: document.glossary.map((term) => ({
      ...term,
      explanation: rewrite(term.explanation),
    })),
    images: withPictures ? document.images : [],
  };
}
