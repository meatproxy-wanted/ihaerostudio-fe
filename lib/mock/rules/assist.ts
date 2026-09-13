/*
 * MOCK ONLY — delete with the rest of lib/mock when the real server lands.
 *
 * Stand-ins for the AI editing tools: canned answers first, then crude string
 * rules so any sentence gets some plausible response.
 */
import type { ImageCandidate } from "../../api/types";
import type { Card } from "../../domain/document";
import { withParticle } from "../../domain/korean";
import {
  PLAIN_WORDS,
  SIMPLIFY_FIXTURES,
  SPLIT_FIXTURES,
  TERM_DICTIONARY,
} from "../fixtures/sample-assist";
import { ILLUSTRATIONS, illustrationSrc } from "../illustration-library";

export function simplifySuggestions(text: string): string[] {
  const canned = SIMPLIFY_FIXTURES[text];
  if (canned) return canned.slice(0, 3);

  let plain = text;
  for (const [hard, easy] of PLAIN_WORDS) plain = plain.replaceAll(hard, easy);
  return plain !== text ? [plain] : [];
}

export function splitSentences(text: string): string[] {
  const canned = SPLIT_FIXTURES[text];
  if (canned) return canned;

  const parts = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  return parts.length > 1 ? parts : [];
}

export function termCandidates(text: string): string[] {
  return Object.keys(TERM_DICTIONARY).filter((term) => text.includes(term));
}

export function explainTerm(term: string): string {
  return (
    TERM_DICTIONARY[term] ??
    `${withParticle(term, "은/는")} 어떤 뜻인지 쉬운 말로 적어 주세요.`
  );
}

export function imageCandidates(
  card: Card,
  currentSrc: string | null,
): ImageCandidate[] {
  const text = card.sentences.map((sentence) => sentence.text).join(" ");

  return ILLUSTRATIONS.map((illustration) => ({
    illustration,
    score:
      (illustration.roles.includes(card.role) ? 2 : 0) +
      illustration.keywords.filter((keyword) => text.includes(keyword)).length *
        3,
  }))
    .filter(
      ({ illustration, score }) =>
        score > 0 && illustrationSrc(illustration.id) !== currentSrc,
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ illustration }) => ({
      src: illustrationSrc(illustration.id),
      alt: illustration.alt,
      meaning: illustration.meaning,
    }));
}
