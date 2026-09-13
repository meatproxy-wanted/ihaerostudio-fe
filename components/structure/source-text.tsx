"use client";

import { createContext, use, useMemo, type ReactNode } from "react";

import type { Anchor } from "@/lib/domain/common";
import type { SourceDocument } from "@/lib/domain/source";

const SourceTextContext = createContext<Map<string, string> | null>(null);

export function SourceTextProvider({
  source,
  children,
}: {
  source: SourceDocument;
  children: ReactNode;
}) {
  const texts = useMemo(
    () => new Map(source.paragraphs.map((p) => [p.id, p.text])),
    [source.paragraphs],
  );
  return <SourceTextContext value={texts}>{children}</SourceTextContext>;
}

/** The quoted source text an anchor points at. */
export function useAnchorQuote() {
  const texts = use(SourceTextContext);
  return (anchor: Anchor) =>
    texts?.get(anchor.paragraphId)?.slice(anchor.start, anchor.end) ?? "";
}
