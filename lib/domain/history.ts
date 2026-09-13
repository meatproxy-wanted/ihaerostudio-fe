export interface History<T> {
  past: T[];
  future: T[];
}

export const HISTORY_LIMIT = 50;

export function emptyHistory<T>(): History<T> {
  return { past: [], future: [] };
}

/** Remembers `previous` before a change; a new change forgets redo steps. */
export function record<T>(
  history: History<T>,
  previous: T,
  limit = HISTORY_LIMIT,
): History<T> {
  return { past: [...history.past, previous].slice(-limit), future: [] };
}

export function undo<T>(
  history: History<T>,
  current: T,
): { history: History<T>; value: T } | null {
  const value = history.past.at(-1);
  if (value === undefined) return null;
  return {
    value,
    history: {
      past: history.past.slice(0, -1),
      future: [current, ...history.future],
    },
  };
}

export function redo<T>(
  history: History<T>,
  current: T,
): { history: History<T>; value: T } | null {
  const [value, ...future] = history.future;
  if (value === undefined) return null;
  return { value, history: { past: [...history.past, current], future } };
}
