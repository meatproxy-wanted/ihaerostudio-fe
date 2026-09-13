"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useCurrentProject } from "@/components/project-shell/project-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { addTerm, findSentence } from "@/lib/domain/document-ops";
import { cn } from "@/lib/utils";

import { sentenceElementId } from "../editor-canvas";
import { useEditor, useEditorStore } from "../editor-store";
import { ToolError, ToolFrame, ToolLoading } from "./tool-frame";

/** Text the producer selected inside this sentence on the canvas. */
function useSelectedWord(sentenceId: string) {
  const [word, setWord] = useState("");
  useEffect(() => {
    function onSelectionChange() {
      const selection = window.getSelection();
      const element = document.getElementById(sentenceElementId(sentenceId));
      if (
        !selection ||
        selection.isCollapsed ||
        !element ||
        !selection.anchorNode ||
        !element.contains(selection.anchorNode)
      ) {
        return;
      }
      const text = selection.toString().trim();
      if (text.length > 0 && text.length <= 20) setWord(text);
    }
    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, [sentenceId]);
  return word;
}

export function TermTool({ sentenceId }: { sentenceId: string }) {
  const project = useCurrentProject();
  const store = useEditorStore();
  const text = useEditor(
    (state) => findSentence(state.value, sentenceId)?.sentence.text ?? "",
  );
  const glossary = useEditor((state) => state.value.glossary);
  const clicked = useEditor((state) => state.toolArgument);
  const [chosen, setChosen] = useState<string | null>(clicked);
  const selectedWord = useSelectedWord(sentenceId);

  const candidates = useQuery({
    queryKey: ["assist", "terms", project.id, text],
    queryFn: ({ signal }) =>
      api.assist.termCandidates(project.id, { text }, { signal }),
    staleTime: Infinity,
    retry: 0,
  });

  const registered = new Map(glossary.map((term) => [term.term, term]));

  return (
    <ToolFrame title="용어 설명 추가">
      {chosen === null ? (
        <>
          <p className="text-2sm text-muted-foreground">
            풀이가 필요한 말을 고르세요. 캔버스의 문장에서 글자를 드래그해
            골라도 돼요.
          </p>
          {candidates.isPending ? (
            <ToolLoading label="어려운 말을 찾고 있어요" />
          ) : candidates.isError ? (
            <ToolError
              error={candidates.error}
              onRetry={() => candidates.refetch()}
            />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {candidates.data.terms.length === 0 && (
                <p className="text-2sm text-muted-foreground">
                  AI가 찾은 어려운 말이 없어요.
                </p>
              )}
              {candidates.data.terms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setChosen(term)}
                  className={cn(
                    "h-8 rounded-full px-3 text-2sm font-semibold ring-1",
                    registered.has(term)
                      ? "text-muted-foreground ring-hairline"
                      : "bg-info/10 text-info ring-info/30 hover:bg-info/15",
                  )}
                >
                  {term}
                  {registered.has(term) && " · 풀이 있음"}
                </button>
              ))}
            </div>
          )}
          {selectedWord && (
            <Button
              size="sm"
              variant="secondary"
              className="self-start"
              onClick={() => setChosen(selectedWord)}
            >
              선택한 “{selectedWord}” 풀이하기
            </Button>
          )}
        </>
      ) : (
        <TermEditor
          key={chosen}
          term={chosen}
          context={text}
          existing={registered.get(chosen)?.explanation ?? null}
          onBack={() => setChosen(null)}
          onSave={(explanation) => {
            const exists = registered.has(chosen);
            store.getState().apply((document) =>
              addTerm(document, {
                id: `term-${crypto.randomUUID().slice(0, 8)}`,
                term: chosen,
                explanation,
              }),
            );
            store.getState().openTool(null);
            toast.add({
              title: exists ? "풀이를 고쳤어요" : "어려운 말 풀이에 넣었어요",
              description: `“${chosen}”에 밑줄이 생기고 풀이 구획에 모여요.`,
              type: "success",
            });
          }}
        />
      )}
    </ToolFrame>
  );
}

function TermEditor({
  term,
  context,
  existing,
  onBack,
  onSave,
}: {
  term: string;
  context: string;
  existing: string | null;
  onBack: () => void;
  onSave: (explanation: string) => void;
}) {
  const project = useCurrentProject();
  const [draft, setDraft] = useState<string | null>(existing);
  const explanation = useQuery({
    queryKey: ["assist", "explain", project.id, term],
    queryFn: ({ signal }) =>
      api.assist.explainTerm(project.id, { term, context }, { signal }),
    enabled: existing === null,
    staleTime: Infinity,
    retry: 0,
  });
  const value = draft ?? explanation.data?.explanation ?? "";

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-md font-bold">{term}</p>
      {existing !== null && (
        <p className="rounded-lg bg-secondary px-2.5 py-1.5 text-2sm text-muted-foreground">
          이미 풀이가 있어요. 설명을 고칠 수 있어요.
        </p>
      )}
      {existing === null && explanation.isPending ? (
        <ToolLoading label="쉬운 설명 초안을 만들고 있어요" />
      ) : existing === null && explanation.isError ? (
        <ToolError
          error={explanation.error}
          onRetry={() => explanation.refetch()}
        />
      ) : (
        <>
          <Textarea
            aria-label={`${term} 쉬운 설명`}
            value={value}
            onChange={(event) => setDraft(event.target.value)}
            className="text-md leading-relaxed"
          />
          <p className="text-2sm text-muted-foreground">
            한두 문장으로, 독자가 아는 말로 풀어 주세요.
          </p>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              disabled={!value.trim()}
              onClick={() => onSave(value.trim())}
            >
              {existing === null ? "추가" : "고치기"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onBack}>
              다른 말 고르기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
