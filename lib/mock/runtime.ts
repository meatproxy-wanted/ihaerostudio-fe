/*
 * MOCK ONLY — delete with the rest of lib/mock when the real server lands.
 *
 * Latency, cancellation, failure simulation, and persistence for the mock API.
 */
import { clear, createStore, del, get, set, type UseStore } from "idb-keyval";

import { ApiError } from "../api/errors";

export type MockOperation =
  "analyze" | "draft" | "save" | "assist" | "check" | "publish";

const FAIL_STORAGE_KEY = "ihaerostudio-mock-fail";
const OPERATIONS: MockOperation[] = [
  "analyze",
  "draft",
  "save",
  "assist",
  "check",
  "publish",
];

/**
 * `?mockFail=analyze,save` makes those operations fail for this tab session;
 * `?mockFail=` (empty) turns failures off again.
 */
function failingOperations(): Set<MockOperation> {
  if (typeof window === "undefined") return new Set();
  try {
    const param = new URLSearchParams(window.location.search).get("mockFail");
    if (param !== null) {
      window.sessionStorage.setItem(FAIL_STORAGE_KEY, param);
    }
    const stored = window.sessionStorage.getItem(FAIL_STORAGE_KEY) ?? "";
    return new Set(
      stored
        .split(",")
        .map((value) => value.trim())
        .filter((value): value is MockOperation =>
          OPERATIONS.includes(value as MockOperation),
        ),
    );
  } catch {
    return new Set();
  }
}

export function failIfRequested(operation: MockOperation, message: string) {
  if (failingOperations().has(operation)) {
    throw new ApiError("failed", message);
  }
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** A little jitter so repeated requests do not feel mechanical. */
export function around(ms: number) {
  return Math.round(ms * (0.8 + Math.random() * 0.4));
}

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replaceAll("-", "").slice(0, 10)}`;
}

export function now() {
  return new Date().toISOString();
}

export function clone<T>(value: T): T {
  return structuredClone(value);
}

/* Persistence: IndexedDB when available, otherwise an in-memory map. */

interface KeyValue {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

function memoryStore(): KeyValue {
  const map = new Map<string, unknown>();
  return {
    get: async <T>(key: string) => clone(map.get(key)) as T | undefined,
    set: async (key, value) => void map.set(key, clone(value)),
    del: async (key) => void map.delete(key),
    clear: async () => map.clear(),
  };
}

function indexedDbStore(store: UseStore): KeyValue {
  return {
    get: <T>(key: string) => get<T>(key, store),
    set: (key, value) => set(key, value, store),
    del: (key) => del(key, store),
    clear: () => clear(store),
  };
}

let storePromise: Promise<KeyValue> | undefined;

export function storage(): Promise<KeyValue> {
  storePromise ??= (async () => {
    if (typeof indexedDB === "undefined") return memoryStore();
    try {
      const store = createStore("ihaerostudio-mock", "records");
      await get("__probe__", store);
      return indexedDbStore(store);
    } catch {
      console.warn(
        "[mock] IndexedDB is unavailable; demo data will not survive a reload.",
      );
      return memoryStore();
    }
  })();
  return storePromise;
}
