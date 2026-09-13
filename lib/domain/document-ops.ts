import { anchorsEqual, type Anchor } from "./common";
import type {
  Card,
  CardRole,
  DocImage,
  EasyDocument,
  GlossaryTerm,
  Section,
  SectionKind,
  Sentence,
  SentenceOrigin,
} from "./document";

/* Locating ----------------------------------------------------------------- */

export interface SentenceLocation {
  sectionIndex: number;
  cardIndex: number;
  sentenceIndex: number;
  card: Card;
  sentence: Sentence;
}

export function findSentence(
  document: EasyDocument,
  sentenceId: string,
): SentenceLocation | null {
  for (const [sectionIndex, section] of document.sections.entries()) {
    for (const [cardIndex, card] of section.cards.entries()) {
      const sentenceIndex = card.sentences.findIndex(
        (s) => s.id === sentenceId,
      );
      if (sentenceIndex !== -1) {
        return {
          sectionIndex,
          cardIndex,
          sentenceIndex,
          card,
          sentence: card.sentences[sentenceIndex],
        };
      }
    }
  }
  return null;
}

export function findCard(
  document: EasyDocument,
  cardId: string,
): { sectionIndex: number; cardIndex: number; card: Card } | null {
  for (const [sectionIndex, section] of document.sections.entries()) {
    const cardIndex = section.cards.findIndex((card) => card.id === cardId);
    if (cardIndex !== -1) {
      return { sectionIndex, cardIndex, card: section.cards[cardIndex] };
    }
  }
  return null;
}

export function allSentences(document: EasyDocument): Sentence[] {
  return document.sections.flatMap((section) =>
    section.cards.flatMap((card) => card.sentences),
  );
}

/* Structural helpers ------------------------------------------------------- */

function mapCards(
  document: EasyDocument,
  update: (card: Card, section: Section) => Card | null,
): EasyDocument {
  let changed = false;
  const sections = document.sections.map((section) => {
    const cards: Card[] = [];
    for (const card of section.cards) {
      const next = update(card, section);
      if (next !== card) changed = true;
      if (next) cards.push(next);
    }
    return cards.length === section.cards.length &&
      cards.every((card, index) => card === section.cards[index])
      ? section
      : { ...section, cards };
  });
  return changed ? { ...document, sections } : document;
}

function mapSentence(
  document: EasyDocument,
  sentenceId: string,
  update: (sentence: Sentence) => Sentence,
): EasyDocument {
  return mapCards(document, (card) => {
    const index = card.sentences.findIndex((s) => s.id === sentenceId);
    if (index === -1) return card;
    const next = update(card.sentences[index]);
    if (next === card.sentences[index]) return card;
    const sentences = [...card.sentences];
    sentences[index] = next;
    return { ...card, sentences };
  });
}

function move<T>(items: T[], index: number, direction: -1 | 1): T[] | null {
  const target = index + direction;
  if (index === -1 || target < 0 || target >= items.length) return null;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Drops images no card points at any more. */
function pruneImages(document: EasyDocument): EasyDocument {
  const used = new Set(
    document.sections.flatMap((section) =>
      section.cards.map((card) => card.imageId),
    ),
  );
  const images = document.images.filter((image) => used.has(image.id));
  return images.length === document.images.length
    ? document
    : { ...document, images };
}

/* Sentences ---------------------------------------------------------------- */

/** A producer's own rewrite: it counts as compared with the source. */
export function editSentenceText(
  document: EasyDocument,
  sentenceId: string,
  text: string,
): EasyDocument {
  return mapSentence(document, sentenceId, (sentence) =>
    sentence.text === text
      ? sentence
      : { ...sentence, text, origin: "manual", verified: true },
  );
}

/** An applied AI suggestion keeps the anchors but needs comparing again. */
export function applySuggestion(
  document: EasyDocument,
  sentenceId: string,
  text: string,
): EasyDocument {
  return mapSentence(document, sentenceId, (sentence) => ({
    ...sentence,
    text,
    origin: "ai-suggestion",
    verified: false,
  }));
}

export function applySplit(
  document: EasyDocument,
  sentenceId: string,
  texts: string[],
  newIds: string[],
): EasyDocument {
  if (texts.length === 0 || texts.length !== newIds.length) return document;
  return mapCards(document, (card) => {
    const index = card.sentences.findIndex((s) => s.id === sentenceId);
    if (index === -1) return card;
    const original = card.sentences[index];
    const replacements: Sentence[] = texts.map((text, position) => ({
      id: newIds[position],
      text,
      anchors: original.anchors,
      origin: "ai-suggestion" satisfies SentenceOrigin,
      verified: false,
    }));
    const sentences = [...card.sentences];
    sentences.splice(index, 1, ...replacements);
    return { ...card, sentences };
  });
}

export function setVerified(
  document: EasyDocument,
  sentenceId: string,
  verified: boolean,
): EasyDocument {
  return mapSentence(document, sentenceId, (sentence) =>
    sentence.verified === verified ? sentence : { ...sentence, verified },
  );
}

export function insertSentenceAfter(
  document: EasyDocument,
  sentenceId: string,
  newId: string,
): EasyDocument {
  return mapCards(document, (card) => {
    const index = card.sentences.findIndex((s) => s.id === sentenceId);
    if (index === -1) return card;
    const sentences = [...card.sentences];
    sentences.splice(index + 1, 0, {
      id: newId,
      text: "",
      anchors: [],
      origin: "manual",
      verified: true,
    });
    return { ...card, sentences };
  });
}

/** Cards always keep one sentence; remove the card instead. */
export function removeSentence(
  document: EasyDocument,
  sentenceId: string,
): EasyDocument {
  return mapCards(document, (card) => {
    const index = card.sentences.findIndex((s) => s.id === sentenceId);
    if (index === -1 || card.sentences.length === 1) return card;
    return {
      ...card,
      sentences: card.sentences.filter((s) => s.id !== sentenceId),
    };
  });
}

export function moveSentence(
  document: EasyDocument,
  sentenceId: string,
  direction: -1 | 1,
): EasyDocument {
  return mapCards(document, (card) => {
    const index = card.sentences.findIndex((s) => s.id === sentenceId);
    if (index === -1) return card;
    const sentences = move(card.sentences, index, direction);
    return sentences ? { ...card, sentences } : card;
  });
}

export function addAnchorToSentence(
  document: EasyDocument,
  sentenceId: string,
  anchor: Anchor,
): EasyDocument {
  return mapSentence(document, sentenceId, (sentence) =>
    sentence.anchors.some((existing) => anchorsEqual(existing, anchor))
      ? sentence
      : { ...sentence, anchors: [...sentence.anchors, anchor] },
  );
}

export function removeAnchorFromSentence(
  document: EasyDocument,
  sentenceId: string,
  anchor: Anchor,
): EasyDocument {
  return mapSentence(document, sentenceId, (sentence) => ({
    ...sentence,
    anchors: sentence.anchors.filter(
      (existing) => !anchorsEqual(existing, anchor),
    ),
  }));
}

/* Cards -------------------------------------------------------------------- */

export function addCard(
  document: EasyDocument,
  options: {
    section: SectionKind;
    cardId: string;
    sentenceId: string;
    role: CardRole;
    partyId?: string | null;
    afterCardId?: string;
  },
): EasyDocument {
  const card: Card = {
    id: options.cardId,
    role: options.role,
    partyId: options.partyId ?? null,
    imageId: null,
    sentences: [
      {
        id: options.sentenceId,
        text: "",
        anchors: [],
        origin: "manual",
        verified: true,
      },
    ],
  };
  return {
    ...document,
    sections: document.sections.map((section) => {
      if (section.kind !== options.section) return section;
      const cards = [...section.cards];
      const after = cards.findIndex((item) => item.id === options.afterCardId);
      cards.splice(after === -1 ? cards.length : after + 1, 0, card);
      return { ...section, cards };
    }),
  };
}

export function removeCard(
  document: EasyDocument,
  cardId: string,
): EasyDocument {
  return pruneImages(
    mapCards(document, (card) => (card.id === cardId ? null : card)),
  );
}

export function moveCard(
  document: EasyDocument,
  cardId: string,
  direction: -1 | 1,
): EasyDocument {
  let changed = false;
  const sections = document.sections.map((section) => {
    const index = section.cards.findIndex((card) => card.id === cardId);
    if (index === -1) return section;
    const cards = move(section.cards, index, direction);
    if (!cards) return section;
    changed = true;
    return { ...section, cards };
  });
  return changed ? { ...document, sections } : document;
}

export function setCardImage(
  document: EasyDocument,
  cardId: string,
  image: DocImage | null,
): EasyDocument {
  const withImage = image
    ? {
        ...document,
        images: [
          ...document.images.filter((item) => item.id !== image.id),
          image,
        ],
      }
    : document;
  return pruneImages(
    mapCards(withImage, (card) =>
      card.id === cardId ? { ...card, imageId: image?.id ?? null } : card,
    ),
  );
}

export function updateImageText(
  document: EasyDocument,
  imageId: string,
  patch: Partial<Pick<DocImage, "alt" | "meaning">>,
): EasyDocument {
  return {
    ...document,
    images: document.images.map((image) =>
      image.id === imageId ? { ...image, ...patch } : image,
    ),
  };
}

/* Titles ------------------------------------------------------------------- */

export function updateTitles(
  document: EasyDocument,
  patch: Partial<Pick<EasyDocument, "title" | "subtitle">>,
): EasyDocument {
  return { ...document, ...patch };
}

export function updateSectionTitle(
  document: EasyDocument,
  kind: SectionKind,
  title: string,
): EasyDocument {
  return {
    ...document,
    sections: document.sections.map((section) =>
      section.kind === kind ? { ...section, title } : section,
    ),
  };
}

/* Glossary ----------------------------------------------------------------- */

/** Adds a term, or updates the explanation when the term already exists. */
export function addTerm(
  document: EasyDocument,
  term: GlossaryTerm,
): EasyDocument {
  const word = term.term.trim();
  const existing = document.glossary.find((item) => item.term === word);
  if (existing) {
    return {
      ...document,
      glossary: document.glossary.map((item) =>
        item.id === existing.id
          ? { ...item, explanation: term.explanation }
          : item,
      ),
    };
  }
  return {
    ...document,
    glossary: [...document.glossary, { ...term, term: word }],
  };
}

export function updateTerm(
  document: EasyDocument,
  termId: string,
  patch: Partial<Pick<GlossaryTerm, "term" | "explanation">>,
): EasyDocument {
  return {
    ...document,
    glossary: document.glossary.map((item) =>
      item.id === termId ? { ...item, ...patch } : item,
    ),
  };
}

export function removeTerm(
  document: EasyDocument,
  termId: string,
): EasyDocument {
  return {
    ...document,
    glossary: document.glossary.filter((item) => item.id !== termId),
  };
}

export interface TermRange {
  start: number;
  end: number;
  termId: string;
}

/**
 * Where glossary terms appear in a text. Terms are matched by their surface
 * form, longest first, so "임대차보증금" wins over "보증금" at the same place.
 */
export function findTermRanges(
  text: string,
  terms: GlossaryTerm[],
): TermRange[] {
  const sorted = [...terms]
    .filter((term) => term.term.trim().length > 0)
    .sort((a, b) => b.term.length - a.term.length);
  const taken: boolean[] = new Array(text.length).fill(false);
  const ranges: TermRange[] = [];

  for (const term of sorted) {
    let from = 0;
    for (;;) {
      const start = text.indexOf(term.term, from);
      if (start === -1) break;
      const end = start + term.term.length;
      if (!taken.slice(start, end).some(Boolean)) {
        ranges.push({ start, end, termId: term.id });
        taken.fill(true, start, end);
      }
      from = start + 1;
    }
  }
  return ranges.sort((a, b) => a.start - b.start);
}

/** The glossary as readers meet it: by first appearance, unused terms last. */
export function glossaryInReadingOrder(
  document: EasyDocument,
): { term: GlossaryTerm; used: boolean }[] {
  const firstSeen = new Map<string, number>();
  let offset = 0;
  for (const sentence of allSentences(document)) {
    for (const range of findTermRanges(sentence.text, document.glossary)) {
      if (!firstSeen.has(range.termId)) {
        firstSeen.set(range.termId, offset + range.start);
      }
    }
    offset += sentence.text.length + 1;
  }
  return [...document.glossary]
    .map((term) => ({ term, used: firstSeen.has(term.id) }))
    .sort(
      (a, b) =>
        (firstSeen.get(a.term.id) ?? Infinity) -
        (firstSeen.get(b.term.id) ?? Infinity),
    );
}

/* Progress and navigation -------------------------------------------------- */

export function verificationProgress(document: EasyDocument) {
  const sentences = allSentences(document);
  return {
    verified: sentences.filter((sentence) => sentence.verified).length,
    total: sentences.length,
  };
}

export function sentencesWithoutAnchors(document: EasyDocument): Sentence[] {
  return allSentences(document).filter(
    (sentence) => sentence.anchors.length === 0,
  );
}

/** Sentences the producer has worked on, which regenerating would discard. */
export function countTouchedSentences(document: EasyDocument): number {
  return allSentences(document).filter(
    (sentence) => sentence.origin !== "ai-draft" || sentence.verified,
  ).length;
}

/** The previous or next sentence in reading order, across cards and sections. */
export function neighborSentenceId(
  document: EasyDocument,
  sentenceId: string,
  direction: -1 | 1,
): string | null {
  const ids = allSentences(document).map((sentence) => sentence.id);
  const index = ids.indexOf(sentenceId);
  if (index === -1) return null;
  return ids[index + direction] ?? null;
}
