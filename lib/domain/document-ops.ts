import type { EasyDocument, Sentence } from "./document";

export function allSentences(document: EasyDocument): Sentence[] {
  return document.sections.flatMap((section) =>
    section.cards.flatMap((card) => card.sentences),
  );
}

/** Sentences the producer has worked on, which regenerating would discard. */
export function countTouchedSentences(document: EasyDocument): number {
  return allSentences(document).filter(
    (sentence) => sentence.origin !== "ai-draft" || sentence.verified,
  ).length;
}
