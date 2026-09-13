"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Redo02Icon, Undo02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { verificationProgress } from "@/lib/domain/document-ops";

import { useEditor, useEditorStore } from "./editor-store";

/** Verification progress and undo/redo for the top bar. */
export function EditorToolbar() {
  const store = useEditorStore();
  const canUndo = useEditor((state) => state.history.past.length > 0);
  const canRedo = useEditor((state) => state.history.future.length > 0);
  // Numbers, not the progress object: a fresh object per call would loop.
  const verified = useEditor(
    (state) => verificationProgress(state.value).verified,
  );
  const total = useEditor((state) => verificationProgress(state.value).total);

  return (
    <div className="flex items-center gap-1">
      <span
        className="mr-2 rounded-full bg-secondary px-2.5 py-1 text-2sm font-semibold whitespace-nowrap tabular-nums"
        title="원문과 대조한 문장 수"
      >
        원문 대조 {verified}/{total}
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="되돌리기"
              disabled={!canUndo}
              onClick={() => store.getState().undo()}
            />
          }
        >
          <HugeiconsIcon icon={Undo02Icon} strokeWidth={2} />
        </TooltipTrigger>
        <TooltipContent side="bottom">되돌리기 ⌘Z</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="다시 하기"
              disabled={!canRedo}
              onClick={() => store.getState().redo()}
            />
          }
        >
          <HugeiconsIcon icon={Redo02Icon} strokeWidth={2} />
        </TooltipTrigger>
        <TooltipContent side="bottom">다시 하기 ⇧⌘Z</TooltipContent>
      </Tooltip>
    </div>
  );
}
