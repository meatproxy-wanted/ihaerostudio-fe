"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  glossaryInReadingOrder,
  removeTerm,
  updateTerm,
} from "@/lib/domain/document-ops";

import { useEditor, useEditorStore } from "./editor-store";

/** Every glossary term in reading order, editable from the summary panel. */
export function GlossaryManager() {
  const store = useEditorStore();
  const document = useEditor((state) => state.value);
  const entries = glossaryInReadingOrder(document);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(
    null,
  );

  if (entries.length === 0) {
    return (
      <p className="text-2sm text-muted-foreground">아직 풀이한 말이 없어요.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map(({ term, used }) => (
        <li
          key={term.id}
          className="flex flex-col gap-1.5 rounded-xl bg-card p-2.5 ring-1 ring-hairline"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{term.term}</span>
            {!used && (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                문장에 없음
              </span>
            )}
            <div className="ml-auto flex">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`${term.term} 풀이 고치기`}
                onClick={() =>
                  setEditing({ id: term.id, text: term.explanation })
                }
              >
                <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`${term.term} 풀이 지우기`}
                className="text-muted-foreground hover:text-destructive"
                onClick={() =>
                  store.getState().apply((value) => removeTerm(value, term.id))
                }
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              </Button>
            </div>
          </div>
          {editing?.id === term.id ? (
            <div className="flex flex-col gap-1.5">
              <Textarea
                autoFocus
                aria-label={`${term.term} 쉬운 설명`}
                value={editing.text}
                onChange={(event) =>
                  setEditing({ id: term.id, text: event.target.value })
                }
                className="text-2sm"
              />
              <div className="flex gap-1">
                <Button
                  size="xs"
                  disabled={!editing.text.trim()}
                  onClick={() => {
                    store.getState().apply((value) =>
                      updateTerm(value, term.id, {
                        explanation: editing.text.trim(),
                      }),
                    );
                    setEditing(null);
                  }}
                >
                  저장
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-2sm leading-relaxed text-muted-foreground">
              {term.explanation}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
