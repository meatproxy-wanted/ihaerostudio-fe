"use client";

import { useEffect } from "react";

import { neighborSentenceId, setVerified } from "@/lib/domain/document-ops";

import type { EditorStore } from "./editor-store";

function typingInField(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Editor shortcuts: ↑/↓ move between sentences, Enter edits, Escape clears
 * the selection, ⌘/Ctrl+Enter marks compared and moves on, ⌘/Ctrl+Z undoes,
 * ⇧⌘/Ctrl+Shift+Z redoes. Ignored while typing or inside dialogs.
 */
export function useEditorKeyboard(store: EditorStore) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || typingInField(event.target)) return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("[role=dialog],[role=menu],[role=listbox]")
      ) {
        return;
      }
      const state = store.getState();
      const mod = event.metaKey || event.ctrlKey;

      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) state.redo();
        else state.undo();
        return;
      }

      // Navigation keys belong to the canvas: Enter on a focused button or
      // link must activate that control, not start editing a sentence.
      const target = event.target as HTMLElement | null;
      const onCanvas =
        target === document.body || target?.closest("[data-sentence-id]");
      if (!onCanvas) return;

      const selection = state.selection;
      if (event.key === "Escape" && selection) {
        event.preventDefault();
        state.select(null);
        return;
      }
      if (selection?.type !== "sentence") return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const next = neighborSentenceId(
          state.value,
          selection.id,
          event.key === "ArrowDown" ? 1 : -1,
        );
        if (next) {
          event.preventDefault();
          state.select({ type: "sentence", id: next });
        }
        return;
      }
      if (event.key === "Enter" && mod) {
        event.preventDefault();
        state.apply((document) => setVerified(document, selection.id, true));
        const next = neighborSentenceId(state.value, selection.id, 1);
        if (next) store.getState().select({ type: "sentence", id: next });
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        state.startEditing(selection.id);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [store]);
}
