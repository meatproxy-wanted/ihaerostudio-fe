/*
 * MOCK ONLY — delete with the rest of lib/mock when the real server lands.
 */
import type { Anchor } from "../../domain/common";
import { SAMPLE_PARAGRAPHS } from "./sample-source";

const textById = new Map(SAMPLE_PARAGRAPHS.map((p) => [p.id, p.text]));

/**
 * Anchors a quote inside a sample paragraph. Fixtures cite quotes instead of
 * hand-counted offsets; a quote that is not in the paragraph fails loudly.
 */
export function quote(paragraphId: string, text?: string): Anchor {
  const paragraph = textById.get(paragraphId);
  if (paragraph === undefined) {
    throw new Error(`Unknown sample paragraph: ${paragraphId}`);
  }
  if (text === undefined) {
    return { paragraphId, start: 0, end: paragraph.length };
  }
  const start = paragraph.indexOf(text);
  if (start === -1) {
    throw new Error(`Quote not found in ${paragraphId}: ${text}`);
  }
  return { paragraphId, start, end: start + text.length };
}
