"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStore, type StoreApi } from "zustand";

export type SaveStatus = "idle" | "saving" | "error";

/** The part of an editing store that autosave drives. */
export interface AutosaveSlice<T> {
  value: T;
  /** Bumped by every local edit. */
  changeCount: number;
  /** The change count the server has confirmed. */
  savedChangeCount: number;
  saveStatus: SaveStatus;
  saveError: unknown;
  markSaving: () => void;
  /** Records a confirmed save of the value as it was at change `at`. */
  markSaved: (at: number, saved: T) => void;
  markError: (error: unknown) => void;
}

export function autosaveDefaults<T>(value: T) {
  return {
    value,
    changeCount: 0,
    savedChangeCount: 0,
    saveStatus: "idle" as SaveStatus,
    saveError: null as unknown,
  };
}

/**
 * Saves a store's value once edits pause, one request at a time. Edits made
 * while a save is in flight are saved right after it. Pending edits are
 * flushed when the editor unmounts and guarded on tab close.
 */
export function useAutosave<T>({
  store,
  save,
  delayMs = 1000,
}: {
  store: StoreApi<AutosaveSlice<T>>;
  save: (value: T) => Promise<T>;
  delayMs?: number;
}) {
  const changeCount = useStore(store, (state) => state.changeCount);
  const savedChangeCount = useStore(store, (state) => state.savedChangeCount);
  const saveStatus = useStore(store, (state) => state.saveStatus);
  const inFlight = useRef<Promise<void> | null>(null);
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  });

  /**
   * Saves until the server has every edit. Resolves true once nothing is
   * pending, or false when a save failed (the edits stay in the store).
   */
  const flush = useCallback(async (): Promise<boolean> => {
    for (;;) {
      if (inFlight.current) {
        await inFlight.current;
        continue;
      }
      const state = store.getState();
      if (state.changeCount === state.savedChangeCount) return true;
      const at = state.changeCount;
      state.markSaving();
      let failed = false;
      inFlight.current = saveRef
        .current(state.value)
        .then((saved) => store.getState().markSaved(at, saved))
        .catch((error: unknown) => {
          failed = true;
          store.getState().markError(error);
        })
        .finally(() => {
          inFlight.current = null;
        });
      await inFlight.current;
      if (failed) return false;
    }
  }, [store]);

  const dirty = changeCount !== savedChangeCount;

  useEffect(() => {
    if (!dirty || saveStatus !== "idle") return;
    const timer = setTimeout(() => void flush(), delayMs);
    return () => clearTimeout(timer);
  }, [dirty, changeCount, saveStatus, flush, delayMs]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => () => void flush(), [flush]);

  return { flush, dirty, saveStatus };
}
