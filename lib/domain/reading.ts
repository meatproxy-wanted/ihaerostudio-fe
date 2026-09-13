import type { ReaderContent } from "./publication";

export type ReadingPage =
  | { type: "cover" }
  | { type: "section"; sectionIndex: number; number: number }
  | { type: "end" };

/**
 * The reader walks cover → sections → end, one screen at a time. Sections
 * with nothing to show are skipped and the rest renumbered.
 */
export function readingPages(content: ReaderContent): ReadingPage[] {
  const pages: ReadingPage[] = [{ type: "cover" }];
  let number = 0;
  content.sections.forEach((section, sectionIndex) => {
    const empty =
      section.kind === "glossary"
        ? content.glossary.length === 0
        : section.cards.length === 0;
    if (empty) return;
    number += 1;
    pages.push({ type: "section", sectionIndex, number });
  });
  pages.push({ type: "end" });
  return pages;
}

export function formatKoreanDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일`;
}
