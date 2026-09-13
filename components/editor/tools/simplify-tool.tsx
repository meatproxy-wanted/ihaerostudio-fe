"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useCurrentProject } from "@/components/project-shell/project-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { applySuggestion, findSentence } from "@/lib/domain/document-ops";
import { cn } from "@/lib/utils";

import { DiffView, NumberWarning } from "../diff-view";
import { useEditor, useEditorStore } from "../editor-store";
import { ToolError, ToolFrame, ToolLoading } from "./tool-frame";

export function SimplifyTool({ sentenceId }: { sentenceId: string }) {
  const project = useCurrentProject();
  const store = useEditorStore();
  const text = useEditor(
    (state) => findSentence(state.value, sentenceId)?.sentence.text ?? "",
  );
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["assist", "simplify", project.id, sentenceId, text],
    queryFn: ({ signal }) =>
      api.assist.simplify(project.id, { sentenceId, text }, { signal }),
    staleTime: Infinity,
    retry: 0,
  });

  function apply(next: string) {
    const trimmed = next.trim();
    if (!trimmed) return;
    const state = store.getState();
    state.apply((document) => applySuggestion(document, sentenceId, trimmed));
    state.openTool(null);
    toast.add({
      title: "수정안을 적용했어요",
      description: "AI가 바꾼 문장이에요. 원문과 다시 대조해 주세요.",
      type: "success",
    });
  }

  const suggestions = query.data?.suggestions ?? [];
  const current = suggestions[Math.min(active, suggestions.length - 1)];

  return (
    <ToolFrame title="더 쉽게 바꾸기">
      {query.isPending || query.isFetching ? (
        <ToolLoading label="더 쉬운 수정안을 만들고 있어요" />
      ) : query.isError ? (
        <ToolError error={query.error} onRetry={() => query.refetch()} />
      ) : !current ? (
        <p className="text-2sm text-muted-foreground">
          더 쉽게 바꿀 곳을 찾지 못했어요. 직접 고쳐 보세요.
        </p>
      ) : (
        <>
          {suggestions.length > 1 && (
            <div role="tablist" aria-label="수정안" className="flex gap-1">
              {suggestions.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  onClick={() => {
                    setActive(index);
                    setDraft(null);
                  }}
                  className={cn(
                    "h-7 rounded-full px-3 text-2sm font-medium ring-1 ring-hairline",
                    index === active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  수정안 {index + 1}
                </button>
              ))}
            </div>
          )}

          {draft === null ? (
            <DiffView before={text} after={current} />
          ) : (
            <Textarea
              autoFocus
              aria-label="수정안 고치기"
              value={draft}
              onChange={(event) =>
                setDraft(event.target.value.replace(/\n/g, " "))
              }
              className="text-md leading-relaxed"
            />
          )}
          <NumberWarning before={text} after={draft ?? current} />

          <div className="flex flex-wrap gap-1.5">
            {draft === null ? (
              <>
                <Button size="sm" onClick={() => apply(current)}>
                  적용
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setDraft(current)}
                >
                  고쳐서 적용
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setActive(0);
                    void query.refetch();
                  }}
                >
                  다시 제안
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => apply(draft)}>
                  이대로 적용
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDraft(null)}
                >
                  취소
                </Button>
              </>
            )}
          </div>
          <p className="text-2sm text-muted-foreground">
            적용하기 전에는 문장이 바뀌지 않아요. 적용한 문장은 원문과 다시
            대조해야 해요.
          </p>
        </>
      )}
    </ToolFrame>
  );
}
