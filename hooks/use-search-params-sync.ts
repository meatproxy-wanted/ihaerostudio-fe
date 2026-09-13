"use client";

import { useEffect } from "react";

/**
 * Mirrors screen state into the address bar without navigating, so reloading
 * or sharing the link lands on the same view. A `null` value removes that
 * parameter; parameters the screen doesn't manage are left alone.
 */
export function useSearchParamsSync(params: Record<string, string | null>) {
  const managed = Object.keys(params).join(",");
  const query = new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => entry[1] !== null,
    ),
  ).toString();

  useEffect(() => {
    const url = new URL(window.location.href);
    for (const key of managed.split(",")) url.searchParams.delete(key);
    for (const [key, value] of new URLSearchParams(query)) {
      url.searchParams.set(key, value);
    }
    if (url.href !== window.location.href) {
      window.history.replaceState(null, "", url);
    }
  }, [managed, query]);
}
