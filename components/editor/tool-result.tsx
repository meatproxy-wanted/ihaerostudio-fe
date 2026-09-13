"use client";

import { findSentence } from "@/lib/domain/document-ops";

import { useEditor, type ToolKey } from "./editor-store";
import { ImageTool } from "./tools/image-tool";
import { SimplifyTool } from "./tools/simplify-tool";
import { SplitTool } from "./tools/split-tool";
import { TermTool } from "./tools/term-tool";

/** Where a tool shows its work for the selected sentence or card. */
export function ToolResult({
  tool,
  sentenceId,
  cardId,
}: {
  tool: ToolKey;
  sentenceId?: string;
  cardId?: string;
}) {
  const argument = useEditor((state) => state.toolArgument);
  const sentenceCardId = useEditor((state) =>
    sentenceId ? findSentence(state.value, sentenceId)?.card.id : undefined,
  );
  const imageCardId = cardId ?? sentenceCardId;
  if (tool === "image" && imageCardId) {
    return (
      <ImageTool
        key={imageCardId}
        cardId={imageCardId}
        closable={cardId === undefined}
      />
    );
  }
  if (tool === "simplify" && sentenceId) {
    return <SimplifyTool key={sentenceId} sentenceId={sentenceId} />;
  }
  if (tool === "split" && sentenceId) {
    return <SplitTool key={sentenceId} sentenceId={sentenceId} />;
  }
  if (tool === "term" && sentenceId) {
    return (
      <TermTool key={`${sentenceId}:${argument}`} sentenceId={sentenceId} />
    );
  }
  return null;
}
