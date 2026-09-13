const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

/**
 * Whether each digit's reading ends in a final consonant (영 일 이 삼 사 오 육
 * 칠 팔 구). A trailing 0 in a longer number reads 십·백·천·만, which also do.
 */
const DIGIT_HAS_FINAL = [
  true,
  true,
  false,
  true,
  false,
  false,
  true,
  true,
  true,
  false,
];

/** The word a particle attaches to, ignoring a trailing "(설명)" and spaces. */
function stem(word: string) {
  return word.replace(/\s*\([^)]*\)\s*$/, "").trimEnd();
}

export function hasFinalConsonant(word: string): boolean {
  const last = stem(word).at(-1);
  if (!last) return false;
  if (/\d/.test(last)) return DIGIT_HAS_FINAL[Number(last)];
  const code = last.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return false;
  return (code - HANGUL_START) % 28 !== 0;
}

export type ParticlePair = "이/가" | "은/는" | "을/를" | "과/와";

export function withParticle(word: string, pair: ParticlePair): string {
  const [afterConsonant, afterVowel] = pair.split("/");
  return word + (hasFinalConsonant(word) ? afterConsonant : afterVowel);
}
