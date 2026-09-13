"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Link04Icon,
} from "@hugeicons/core-free-icons";

import { useAnchorQuote } from "@/components/source-viewer/source-text";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  allSentences,
  findCard,
  findSentence,
  removeAnchorFromSentence,
  sentencesWithoutAnchors,
  setVerified,
  verificationProgress,
} from "@/lib/domain/document-ops";
import { CARD_ROLE_LABELS } from "@/lib/domain/document";
import { cn } from "@/lib/utils";

import { useEditor, useEditorStore } from "./editor-store";

function PanelSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-2.5 px-4 py-4", className)}>
      <h3 className="text-2sm font-semibold text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function ToolPanel() {
  const selection = useEditor((state) => state.selection);
  return (
    <aside
      aria-label="문장 도구"
      className="flex h-full min-h-0 flex-col divide-y divide-hairline overflow-y-auto bg-background"
    >
      {selection?.type === "sentence" ? (
        <SentencePanel key={selection.id} id={selection.id} />
      ) : selection?.type === "card" ? (
        <CardPanel key={selection.id} id={selection.id} />
      ) : (
        <DocumentSummary />
      )}
    </aside>
  );
}

function DocumentSummary() {
  const store = useEditorStore();
  const document = useEditor((state) => state.value);
  const progress = verificationProgress(document);
  const unanchored = sentencesWithoutAnchors(document);
  const firstUnverified = allSentences(document).find((s) => !s.verified);

  return (
    <>
      <div className="px-4 py-4">
        <h2 className="text-md font-bold">문서 요약</h2>
        <p className="mt-1 text-2sm text-muted-foreground">
          문장을 누르면 원문 근거가 강조되고 도구가 열려요.
        </p>
      </div>
      <PanelSection title="원문 대조">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold tabular-nums">
            {progress.verified}
            <span className="text-md text-muted-foreground">
              {" "}
              / {progress.total}
            </span>
          </span>
          {firstUnverified && (
            <Button
              variant="weak"
              size="xs"
              onClick={() =>
                store
                  .getState()
                  .select({ type: "sentence", id: firstUnverified.id })
              }
            >
              대조 안 한 문장으로
            </Button>
          )}
        </div>
        <Progress
          value={
            progress.total ? (progress.verified / progress.total) * 100 : 0
          }
          aria-label="원문 대조 진행률"
        />
      </PanelSection>
      <PanelSection title={`원문 근거가 없는 문장 ${unanchored.length}개`}>
        {unanchored.length === 0 ? (
          <p className="text-2sm text-muted-foreground">
            모든 문장에 근거가 있어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {unanchored.map((sentence) => (
              <li key={sentence.id}>
                <button
                  type="button"
                  onClick={() =>
                    store
                      .getState()
                      .select({ type: "sentence", id: sentence.id })
                  }
                  className="w-full truncate rounded-lg bg-warning/10 px-2.5 py-1.5 text-left text-2sm text-foreground hover:bg-warning/15"
                >
                  {sentence.text || "(빈 문장)"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PanelSection>
      <PanelSection title="단축키">
        <ul className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-2sm">
          <li className="contents">
            <kbd className="font-mono text-muted-foreground">↑ ↓</kbd>
            <span>이전·다음 문장</span>
          </li>
          <li className="contents">
            <kbd className="font-mono text-muted-foreground">Enter</kbd>
            <span>직접 수정</span>
          </li>
          <li className="contents">
            <kbd className="font-mono text-muted-foreground">⌘ Enter</kbd>
            <span>대조했어요 · 다음 문장</span>
          </li>
          <li className="contents">
            <kbd className="font-mono text-muted-foreground">⌘ Z</kbd>
            <span>되돌리기</span>
          </li>
        </ul>
      </PanelSection>
    </>
  );
}

function SentencePanel({ id }: { id: string }) {
  const store = useEditorStore();
  // Select the stored objects themselves: a fresh wrapper object per call
  // would make the store subscription loop.
  const sentence = useEditor(
    (state) => findSentence(state.value, id)?.sentence,
  );
  const card = useEditor((state) => findSentence(state.value, id)?.card);
  const quote = useAnchorQuote();
  if (!sentence || !card) return null;

  return (
    <>
      <div className="flex flex-col gap-2 px-4 py-4">
        <p className="text-2sm font-semibold text-muted-foreground">
          선택한 문장 · {CARD_ROLE_LABELS[card.role]}
        </p>
        <p className="text-md leading-relaxed [word-break:keep-all]">
          {sentence.text || "(빈 문장)"}
        </p>
        <Button
          variant={sentence.verified ? "secondary" : "default"}
          size="sm"
          className="self-start"
          onClick={() =>
            store
              .getState()
              .apply((document) =>
                setVerified(document, id, !sentence.verified),
              )
          }
        >
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          {sentence.verified ? "대조 완료 · 취소하기" : "원문과 대조했어요"}
        </Button>
      </div>

      <PanelSection title={`원문 근거 ${sentence.anchors.length}`}>
        {sentence.anchors.length === 0 ? (
          <p className="flex items-start gap-2 rounded-lg bg-warning/10 px-2.5 py-2 text-2sm text-warning">
            <HugeiconsIcon
              icon={Link04Icon}
              strokeWidth={2}
              size={16}
              className="mt-0.5"
            />
            원문 근거가 없어요. 원문에서 글자를 드래그해 근거를 이어 주세요.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {sentence.anchors.map((anchor) => (
              <li
                key={`${anchor.paragraphId}:${anchor.start}:${anchor.end}`}
                className="flex items-start gap-2 rounded-lg bg-primary/10 px-2.5 py-1.5 text-2sm"
              >
                <span className="line-clamp-3 flex-1">“{quote(anchor)}”</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="이 근거 빼기"
                  className="text-muted-foreground"
                  onClick={() =>
                    store
                      .getState()
                      .apply((document) =>
                        removeAnchorFromSentence(document, id, anchor),
                      )
                  }
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </PanelSection>
    </>
  );
}

function CardPanel({ id }: { id: string }) {
  const card = useEditor((state) => findCard(state.value, id)?.card);
  if (!card) return null;
  return (
    <div className="px-4 py-4">
      <p className="text-2sm font-semibold text-muted-foreground">
        선택한 카드
      </p>
      <p className="text-md font-bold">{CARD_ROLE_LABELS[card.role]}</p>
      <p className="text-2sm text-muted-foreground">
        문장 {card.sentences.length}개
      </p>
    </div>
  );
}
