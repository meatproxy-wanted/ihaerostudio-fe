"use client";

import type { ToolKey } from "./editor-store";
import { SimplifyTool } from "./tools/simplify-tool";
import { SplitTool } from "./tools/split-tool";

/** Where a tool shows its work for the selected sentence or card. */
export function ToolResult({
  tool,
  sentenceId,
}: {
  tool: ToolKey;
  sentenceId?: string;
  cardId?: string;
}) {
  if (tool === "simplify" && sentenceId) {
    return <SimplifyTool key={sentenceId} sentenceId={sentenceId} />;
  }
  if (tool === "split" && sentenceId) {
    return <SplitTool key={sentenceId} sentenceId={sentenceId} />;
  }
  const labels: Record<ToolKey, string> = {
    simplify: "더 쉽게 바꾸기",
    split: "문장 나누기",
    term: "용어 설명 추가",
    image: "그림 바꾸기",
  };
  return (
    <section className="px-4 py-4 text-2sm text-muted-foreground">
      {labels[tool]} 도구를 준비하고 있어요.
    </section>
  );
}
