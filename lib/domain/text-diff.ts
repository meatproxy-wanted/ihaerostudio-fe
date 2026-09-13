export type DiffPart = { type: "same" | "removed" | "added"; text: string };

/**
 * Words (어절) with their trailing spaces, and punctuation marks, so a
 * replaced word carries its own space instead of matching a stray one.
 */
function tokenize(text: string): string[] {
  return (
    text.match(/[^\s.,!?…·"'“”‘’()[\]]+\s*|[.,!?…·"'“”‘’()[\]]\s*|\s+/g) ?? []
  );
}

/**
 * Word-level diff for short sentences. Character diffs shred Korean particles
 * into noise; whole 어절 read naturally.
 */
export function diffWords(before: string, after: string): DiffPart[] {
  const a = tokenize(before);
  const b = tokenize(after);
  const lengths: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lengths[i][j] =
        a[i] === b[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const parts: DiffPart[] = [];
  const push = (type: DiffPart["type"], text: string) => {
    const last = parts.at(-1);
    if (last?.type === type) last.text += text;
    else parts.push({ type, text });
  };

  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push("same", a[i]);
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      push("removed", a[i++]);
    } else {
      push("added", b[j++]);
    }
  }
  while (i < a.length) push("removed", a[i++]);
  while (j < b.length) push("added", b[j++]);

  return parts;
}

/* Numbers ------------------------------------------------------------------ */

export interface NumberMention {
  kind: "money" | "date" | "percent" | "period";
  /** As written in the text. */
  text: string;
  /** Normalized identity: equal keys mean the same amount, date, or span. */
  key: string;
}

const UNITS: Record<string, number> = {
  조: 1_000_000_000_000,
  억: 100_000_000,
  천만: 10_000_000,
  백만: 1_000_000,
  만: 10_000,
  천: 1_000,
};

const MONEY =
  /((?:\d[\d,]*(?:\.\d+)?\s*(?:조|억|천만|백만|만|천)\s*)*\d[\d,]*(?:\.\d+)?\s*(?:조|억|천만|백만|만|천)?)\s*원/g;
const KOREAN_DATE = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g;
const DOT_DATE = /(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?/g;
const PERCENT = /(\d+(?:\.\d+)?)\s*%/g;
const PERIOD = /(\d+)\s*(년|개월|달|주|일)(?![가-힣]*월)/g;

function moneyValue(expression: string) {
  let total = 0;
  for (const match of expression.matchAll(
    /(\d[\d,]*(?:\.\d+)?)\s*(조|억|천만|백만|만|천)?/g,
  )) {
    const amount = Number(match[1].replaceAll(",", ""));
    total += amount * (match[2] ? UNITS[match[2]] : 1);
  }
  return Math.round(total);
}

function pad(value: string) {
  return value.padStart(2, "0");
}

/** Money, dates, percentages, and spans of time mentioned in a text. */
export function extractNumbers(text: string): NumberMention[] {
  const found: (NumberMention & { index: number; end: number })[] = [];
  const add = (
    match: RegExpMatchArray,
    kind: NumberMention["kind"],
    key: string,
  ) => {
    const index = match.index ?? 0;
    const end = index + match[0].length;
    if (found.some((item) => index < item.end && end > item.index)) return;
    found.push({ kind, text: match[0].trim(), key, index, end });
  };

  for (const match of text.matchAll(MONEY)) {
    add(match, "money", `money:${moneyValue(match[1])}`);
  }
  for (const pattern of [KOREAN_DATE, DOT_DATE]) {
    for (const match of text.matchAll(pattern)) {
      add(match, "date", `date:${match[1]}-${pad(match[2])}-${pad(match[3])}`);
    }
  }
  for (const match of text.matchAll(PERCENT)) {
    add(match, "percent", `percent:${Number(match[1])}`);
  }
  for (const match of text.matchAll(PERIOD)) {
    add(match, "period", `period:${Number(match[1])}${match[2]}`);
  }

  return found
    .sort((a, b) => a.index - b.index)
    .map(({ kind, text: written, key }) => ({ kind, text: written, key }));
}

/** Numbers that disappeared or appeared between two versions of a text. */
export function numberChanges(before: string, after: string) {
  const beforeNumbers = extractNumbers(before);
  const afterNumbers = extractNumbers(after);
  const remaining = [...afterNumbers];
  const removed: NumberMention[] = [];
  for (const mention of beforeNumbers) {
    const match = remaining.findIndex((item) => item.key === mention.key);
    if (match === -1) removed.push(mention);
    else remaining.splice(match, 1);
  }
  return { removed, added: remaining };
}
