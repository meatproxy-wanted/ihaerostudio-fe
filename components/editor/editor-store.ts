"use client";

import { createContext, use } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

import type { EasyDocument } from "@/lib/domain/document";
import {
  emptyHistory,
  record,
  redo,
  undo,
  type History,
} from "@/lib/domain/history";
import type { EditorTool } from "@/lib/routes";
import { autosaveDefaults, type AutosaveSlice } from "@/lib/stores/autosave";

export type ToolKey = EditorTool;

export type EditorSelection =
  { type: "sentence"; id: string } | { type: "card"; id: string } | null;

export interface EditorState extends AutosaveSlice<EasyDocument> {
  history: History<EasyDocument>;
  selection: EditorSelection;
  /** Sentence being rewritten in place on the canvas. */
  editingId: string | null;
  tool: ToolKey | null;
  /** Extra input for the open tool, e.g. the glossary term that was clicked. */
  toolArgument: string | null;
  /** Applies a pure document operation as one undo step. */
  apply: (recipe: (document: EasyDocument) => EasyDocument) => void;
  undo: () => void;
  redo: () => void;
  select: (selection: EditorSelection) => void;
  startEditing: (sentenceId: string) => void;
  stopEditing: () => void;
  openTool: (tool: ToolKey | null, argument?: string) => void;
}

export type EditorStore = StoreApi<EditorState>;

function sameSelection(a: EditorSelection, b: EditorSelection) {
  return a?.type === b?.type && a?.id === b?.id;
}

export function createEditorStore(
  initial: EasyDocument,
  selection: EditorSelection = null,
): EditorStore {
  return createStore<EditorState>()((set) => ({
    ...autosaveDefaults(initial),
    history: emptyHistory(),
    selection,
    editingId: null,
    tool: null,
    toolArgument: null,

    apply: (recipe) =>
      set((state) => {
        const next = recipe(state.value);
        if (next === state.value) return state;
        return {
          value: next,
          history: record(state.history, state.value),
          changeCount: state.changeCount + 1,
          saveStatus: state.saveStatus === "error" ? "idle" : state.saveStatus,
        };
      }),

    undo: () =>
      set((state) => {
        const step = undo(state.history, state.value);
        if (!step) return state;
        return {
          value: step.value,
          history: step.history,
          changeCount: state.changeCount + 1,
          editingId: null,
        };
      }),

    redo: () =>
      set((state) => {
        const step = redo(state.history, state.value);
        if (!step) return state;
        return {
          value: step.value,
          history: step.history,
          changeCount: state.changeCount + 1,
          editingId: null,
        };
      }),

    select: (next) =>
      set((state) =>
        sameSelection(state.selection, next)
          ? state
          : {
              selection: next,
              tool: null,
              toolArgument: null,
              editingId: null,
            },
      ),

    startEditing: (sentenceId) =>
      set({
        selection: { type: "sentence", id: sentenceId },
        editingId: sentenceId,
        tool: null,
        toolArgument: null,
      }),

    stopEditing: () => set({ editingId: null }),

    openTool: (tool, argument) =>
      set({ tool, toolArgument: argument ?? null, editingId: null }),

    markSaving: () => set({ saveStatus: "saving", saveError: null }),

    markSaved: (at, saved) =>
      set((state) => ({
        savedChangeCount: at,
        saveStatus: "idle",
        value: {
          ...state.value,
          saveRevision: saved.saveRevision,
          contentRevision: saved.contentRevision,
        },
      })),

    markError: (saveError) => set({ saveStatus: "error", saveError }),
  }));
}

export const EditorStoreContext = createContext<EditorStore | null>(null);

export function useEditorStore(): EditorStore {
  const store = use(EditorStoreContext);
  if (!store) throw new Error("useEditorStore needs its provider");
  return store;
}

export function useEditor<T>(selector: (state: EditorState) => T): T {
  return useStore(useEditorStore(), selector);
}
