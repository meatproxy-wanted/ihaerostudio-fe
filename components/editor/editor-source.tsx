"use client";

import { useMemo } from "react";

import {
  SourceViewer,
  type SourceMark,
} from "@/components/source-viewer/source-viewer";
import {
  addAnchorToSentence,
  allSentences,
  findCard,
} from "@/lib/domain/document-ops";
import type { SourceDocument } from "@/lib/domain/source";

import { useEditor, useEditorStore } from "./editor-store";

export function EditorSource({ source }: { source: SourceDocument }) {
  const store = useEditorStore();
  const document = useEditor((state) => state.value);
  const selection = useEditor((state) => state.selection);

  const marks = useMemo<SourceMark[]>(
    () =>
      allSentences(document).flatMap((sentence) =>
        sentence.anchors.map((anchor) => ({ key: sentence.id, anchor })),
      ),
    [document],
  );

  const activeKeys = useMemo(() => {
    if (!selection) return [];
    if (selection.type === "sentence") return [selection.id];
    const located = findCard(document, selection.id);
    return located ? located.card.sentences.map((sentence) => sentence.id) : [];
  }, [document, selection]);

  return (
    <SourceViewer
      source={source}
      marks={marks}
      activeKeys={activeKeys}
      onMarkClick={(keys) =>
        store.getState().select({ type: "sentence", id: keys[0] })
      }
      selectionLabel={
        selection?.type === "sentence" ? "선택한 문장의 근거로 추가" : undefined
      }
      onSelectionAction={(anchor) => {
        const current = store.getState().selection;
        if (current?.type !== "sentence") return;
        store
          .getState()
          .apply((value) => addAnchorToSentence(value, current.id, anchor));
      }}
    />
  );
}
