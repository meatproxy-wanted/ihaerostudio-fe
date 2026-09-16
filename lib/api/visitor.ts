const STORAGE_KEY = "ihaerostudio-visitor";
/** What the server accepts as an anonymous token: letters, digits, `._~-`, 16 to 200 long. */
const VALID = /^[A-Za-z0-9._~-]{16,200}$/;

let sessionOnly: string | null = null;

function newToken() {
  return `visitor-${crypto.randomUUID()}`;
}

/**
 * This browser's own identity for the server, made once and kept in
 * localStorage. It stands in for a login on the public demo: the server keeps
 * a workspace per token and never sees who is behind it. Without storage
 * (some private windows) the token lasts for the tab only.
 */
export function visitorToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && VALID.test(stored)) return stored;
    const fresh = newToken();
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    sessionOnly ??= newToken();
    return sessionOnly;
  }
}
