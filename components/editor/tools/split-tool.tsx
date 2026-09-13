"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useCurrentProject } from "@/components/project-shell/project-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { applySplit, findSentence } from "@/lib/domain/document-ops";
import { newClientId } from "@/lib/ids";

import { NumberWarning } from "../diff-view";
import { useEditor, useEditorStore } from "../editor-store";
import { ToolError, ToolFrame, ToolLoading } from "./tool-frame";

export function SplitTool({ sentenceId }: { sentenceId: string }) {
  const project = useCurrentProject();
  const store = useEditorStore();
  const text = useEditor(
    (state) => findSentence(state.value, sentenceId)?.sentence.text ?? "",
  );
  const [drafts, setDrafts] = useState<string[] | null>(null);

  const query = useQuery({
    queryKey: queryKeys.assist.split(project.id, sentenceId, text),
    queryFn: ({ signal }) =>
      api.assist.split(project.id, { sentenceId, text }, { signal }),
    staleTime: Infinity,
    retry: 0,
  });

  function apply(sentences: string[]) {
    const texts = sentences.map((item) => item.trim()).filter(Boolean);
    if (texts.length < 2) return;
    const ids = texts.map(() => newClientId("s"));
    const state = store.getState();
    state.apply((document) => applySplit(document, sentenceId, texts, ids));
    state.select({ type: "sentence", id: ids[0] });
    toast.add({
      title: `문장을 ${texts.length}개로 나눴어요`,
      description: "나눈 문장은 원래 근거를 이어받아요. 원문과 대조해 주세요.",
      type: "success",
    });
  }

  const sentences = query.data?.sentences ?? [];
  const shown = drafts ?? sentences;

  return (
    <ToolFrame title="문장 나누기">
      {query.isPending || query.isFetching ? (
        <ToolLoading label="한 문장에 한 내용만 담도록 나누고 있어요" />
      ) : query.isError ? (
        <ToolError error={query.error} onRetry={() => query.refetch()} />
      ) : sentences.length < 2 ? (
        <p className="text-2sm text-muted-foreground">
          나눌 곳을 찾지 못했어요. 직접 고치거나 [아래에 문장 추가]로 나눠
          보세요.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2.5 rounded-xl bg-card p-3 ring-1 ring-hairline">
            <div>
              <p className="mb-0.5 text-[11px] font-semibold text-muted-foreground">
                지금 · 1문장
              </p>
              <p className="text-md leading-relaxed [word-break:keep-all] text-muted-foreground line-through decoration-destructive/60">
                {text}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
                나눈 결과 · {shown.length}문장
              </p>
              <ol className="flex flex-col gap-1.5">
                {shown.map((sentence, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-1 text-2sm font-bold text-success tabular-nums">
                      {index + 1}
                    </span>
                    {drafts ? (
                      <Textarea
                        aria-label={`나눈 문장 ${index + 1}`}
                        value={sentence}
                        onChange={(event) =>
                          setDrafts(
                            drafts.map((item, position) =>
                              position === index
                                ? event.target.value.replace(/\n/g, " ")
                                : item,
                            ),
                          )
                        }
                        className="min-h-0 text-md"
                      />
                    ) : (
                      <p className="text-md leading-relaxed font-medium [word-break:keep-all]">
                        {sentence}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <NumberWarning before={text} after={shown.join(" ")} />
          <div className="flex flex-wrap gap-1.5">
            {drafts === null ? (
              <>
                <Button size="sm" onClick={() => apply(sentences)}>
                  적용
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setDrafts(sentences)}
                >
                  고쳐서 적용
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void query.refetch()}
                >
                  다시 제안
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => apply(drafts)}>
                  이대로 적용
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDrafts(null)}
                >
                  취소
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </ToolFrame>
  );
}
