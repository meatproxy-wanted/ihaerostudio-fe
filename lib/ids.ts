/**
 * Ids for records the producer creates in the browser (new sentences, cards,
 * terms, pictures). Short, since they only need to be unique in a document.
 */
export function newClientId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
