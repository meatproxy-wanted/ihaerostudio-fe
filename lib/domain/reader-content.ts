import type { Illustrations, Settings, Tone } from "./common";
import type { EasyDocument } from "./document";
import { glossaryInReadingOrder } from "./document-ops";
import { sameValue } from "./equality";
import type { ReaderContent } from "./publication";
import type { CaseOverview } from "./structure";

export interface ReaderContext {
  overview: CaseOverview;
  tone: Tone;
  illustrations: Illustrations;
}

/** What besides the document shapes the reader's copy: the cover and settings. */
export function readerContextFor(
  settings: Pick<Settings, "tone" | "illustrations">,
  overview: CaseOverview,
): ReaderContext {
  return {
    overview,
    tone: settings.tone,
    illustrations: settings.illustrations,
  };
}

/** Projects a document onto what readers see; production data is dropped. */
export function toReaderContent(
  document: EasyDocument,
  context: ReaderContext,
): ReaderContent {
  const names = new Map(
    document.partyNames.map((party) => [party.partyId, party.displayName]),
  );
  const images = new Map(document.images.map((image) => [image.id, image]));

  return {
    title: document.title,
    subtitle: document.subtitle,
    tone: context.tone,
    overview: context.overview,
    sections: document.sections.map((section) => ({
      kind: section.kind,
      title: section.title,
      cards: section.cards.map((card) => {
        const image =
          context.illustrations === "with" && card.imageId
            ? images.get(card.imageId)
            : undefined;
        const namesParty = card.role === "person" || card.role === "claim";
        return {
          id: card.id,
          role: card.role,
          partyName:
            namesParty && card.partyId
              ? (names.get(card.partyId) ?? null)
              : null,
          image: image ? { src: image.src, alt: image.alt } : null,
          sentences: card.sentences.map((sentence) => ({
            id: sentence.id,
            text: sentence.text,
          })),
        };
      }),
    })),
    // Readers meet terms in the order the text uses them.
    glossary: glossaryInReadingOrder(document).map(({ term }) => ({
      id: term.id,
      term: term.term,
      explanation: term.explanation,
    })),
  };
}

/** Whether a reader would notice any difference between the two documents. */
export function isSameReaderContent(
  before: EasyDocument,
  after: EasyDocument,
  context: ReaderContext,
): boolean {
  return sameValue(
    toReaderContent(before, context),
    toReaderContent(after, context),
  );
}
