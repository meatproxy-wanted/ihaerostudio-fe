/**
 * JSON with object keys sorted at every level, so two values that differ only
 * in key order (e.g. a stored fixture versus a schema-parsed copy) compare
 * equal.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, current: unknown) => {
    if (current && typeof current === "object" && !Array.isArray(current)) {
      return Object.fromEntries(
        Object.entries(current as Record<string, unknown>).sort(([a], [b]) =>
          a < b ? -1 : a > b ? 1 : 0,
        ),
      );
    }
    return current;
  });
}

export function sameValue(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}
