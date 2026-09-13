"use client";

import { createContext, use } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

import type { CaseStructure } from "@/lib/domain/structure";
import type { ItemRef } from "@/lib/domain/structure-ops";
import { autosaveDefaults, type AutosaveSlice } from "@/lib/stores/autosave";

export interface StructureState extends AutosaveSlice<CaseStructure> {
  selected: ItemRef | null;
  /** Applies a pure structure operation; no-ops do not count as edits. */
  apply: (recipe: (structure: CaseStructure) => CaseStructure) => void;
  select: (ref: ItemRef | null) => void;
}

export type StructureStore = StoreApi<StructureState>;

export function createStructureStore(initial: CaseStructure): StructureStore {
  return createStore<StructureState>()((set) => ({
    ...autosaveDefaults(initial),
    selected: null,
    apply: (recipe) =>
      set((state) => {
        const next = recipe(state.value);
        if (next === state.value) return state;
        return {
          value: next,
          changeCount: state.changeCount + 1,
          saveStatus: state.saveStatus === "error" ? "idle" : state.saveStatus,
        };
      }),
    select: (selected) => set({ selected }),
    markSaving: () => set({ saveStatus: "saving", saveError: null }),
    markSaved: (at, saved) =>
      set((state) => ({
        savedChangeCount: at,
        saveStatus: "idle",
        value: { ...state.value, revision: saved.revision },
      })),
    markError: (saveError) => set({ saveStatus: "error", saveError }),
  }));
}

export const StructureStoreContext = createContext<StructureStore | null>(null);

export function useStructureStore(): StructureStore {
  const store = use(StructureStoreContext);
  if (!store) throw new Error("useStructureStore needs its provider");
  return store;
}

export function useStructure<T>(selector: (state: StructureState) => T): T {
  return useStore(useStructureStore(), selector);
}
