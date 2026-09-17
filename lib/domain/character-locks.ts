import type { EasyDocument } from "./document";

/** Fixed portrait pixels and actor bindings, not a blanket text-editing lock. */
export function preservesCharacterImages(
  before: EasyDocument,
  after: EasyDocument,
): boolean {
  const people = before.sections
    .flatMap((s) => s.cards)
    .filter((c) => c.role === "person" && c.imageId);
  const nextCards = after.sections.flatMap((s) => s.cards);
  return people.every((person) => {
    const next = nextCards.find((c) => c.id === person.id);
    return (
      next?.role === "person" &&
      next.partyId === person.partyId &&
      next.imageId === person.imageId &&
      after.images.find((i) => i.id === person.imageId)?.src ===
        before.images.find((i) => i.id === person.imageId)?.src
    );
  });
}
