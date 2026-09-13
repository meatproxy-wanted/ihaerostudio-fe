export interface KeyedRange {
  start: number;
  end: number;
  key: string;
}

export interface TextSegment {
  start: number;
  end: number;
  text: string;
  /** Keys of every range covering this segment, in first-seen order. */
  keys: string[];
}

/**
 * Splits a paragraph at every range boundary so overlapping anchors can be
 * rendered as flat, non-nested marks.
 */
export function segmentText(text: string, ranges: KeyedRange[]): TextSegment[] {
  const clamped = ranges
    .map((range) => ({
      key: range.key,
      start: Math.max(0, Math.min(range.start, text.length)),
      end: Math.max(0, Math.min(range.end, text.length)),
    }))
    .filter((range) => range.end > range.start);

  const cuts = new Set([0, text.length]);
  for (const range of clamped) {
    cuts.add(range.start);
    cuts.add(range.end);
  }
  const points = [...cuts].sort((a, b) => a - b);

  const segments: TextSegment[] = [];
  for (let index = 0; index < points.length - 1; index++) {
    const start = points[index];
    const end = points[index + 1];
    if (end === start) continue;
    const keys = [
      ...new Set(
        clamped
          .filter((range) => range.start <= start && range.end >= end)
          .map((range) => range.key),
      ),
    ];
    segments.push({ start, end, text: text.slice(start, end), keys });
  }
  return segments;
}
