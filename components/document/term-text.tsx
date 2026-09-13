import type { ReactNode } from "react";

import type { GlossaryTerm } from "@/lib/domain/document";
import { findTermRanges } from "@/lib/domain/document-ops";

/** Sentence text with glossary terms rendered through `renderTerm`. */
export function TermText({
  text,
  terms,
  renderTerm,
}: {
  text: string;
  terms: GlossaryTerm[];
  renderTerm: (term: GlossaryTerm, surface: string, key: number) => ReactNode;
}) {
  const ranges = findTermRanges(text, terms);
  if (ranges.length === 0) return <>{text}</>;

  const byId = new Map(terms.map((term) => [term.id, term]));
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) parts.push(text.slice(cursor, range.start));
    parts.push(
      renderTerm(
        byId.get(range.termId)!,
        text.slice(range.start, range.end),
        range.start,
      ),
    );
    cursor = range.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}
