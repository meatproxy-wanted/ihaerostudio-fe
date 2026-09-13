"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  Image01Icon,
  LinkBackwardIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";

import { CardFrame, SectionHeading } from "@/components/document/card-frame";
import { CardLabel } from "@/components/document/card-label";
import { DISCLAIMER } from "@/components/document/disclaimer";
import { TermText } from "@/components/document/term-text";
import type { ReaderCard } from "@/lib/domain/publication";
import {
  findSentence,
  glossaryInReadingOrder,
} from "@/lib/domain/document-ops";
import {
  toReaderContent,
  type ReaderContext,
} from "@/lib/domain/reader-content";
import { cn } from "@/lib/utils";

import { useEditor, useEditorStore } from "./editor-store";

export function sentenceElementId(id: string) {
  return `canvas-sentence-${id}`;
}

export function cardElementId(id: string) {
  return `canvas-card-${id}`;
}

export function EditorCanvas({ context }: { context: ReaderContext }) {
  const store = useEditorStore();
  const document = useEditor((state) => state.value);
  const selection = useEditor((state) => state.selection);
  const content = useMemo(
    () => toReaderContent(document, context),
    [document, context],
  );

  useEffect(() => {
    if (!selection) return;
    const element = window.document.getElementById(
      selection.type === "sentence"
        ? sentenceElementId(selection.id)
        : cardElementId(selection.id),
    );
    element?.scrollIntoView({ block: "nearest" });
  }, [selection]);

  return (
    <div
      className="paper h-full overflow-y-auto"
      onClick={(event) => {
        if (event.target === event.currentTarget) store.getState().select(null);
      }}
    >
      <div className="mx-auto flex max-w-[44rem] flex-col gap-10 px-8 pt-14 pb-24 text-lg">
        <p className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-2sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            자동으로 들어가는 안내
          </span>
          {DISCLAIMER.short[context.tone]}
        </p>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl leading-tight font-bold tracking-tight [word-break:keep-all]">
            {content.title}
          </h1>
          <p className="text-lg text-muted-foreground">{content.subtitle}</p>
        </header>

        {content.sections.map((section, index) => (
          <section key={section.kind} className="flex flex-col gap-4">
            <SectionHeading number={index + 1}>
              <h2 className="text-2xl font-bold tracking-tight">
                {section.title}
              </h2>
            </SectionHeading>
            {section.kind === "glossary" ? (
              <CanvasGlossary />
            ) : (
              section.cards.map((card) => (
                <CanvasCard
                  key={card.id}
                  card={card}
                  withPictures={context.illustrations === "with"}
                />
              ))
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function CanvasCard({
  card,
  withPictures,
}: {
  card: ReaderCard;
  withPictures: boolean;
}) {
  const store = useEditorStore();
  const selected = useEditor(
    (state) =>
      state.selection?.type === "card" && state.selection.id === card.id,
  );
  const selectCard = () =>
    store.getState().select({ type: "card", id: card.id });

  const imageSlot = !withPictures ? undefined : (
    <button
      type="button"
      onClick={selectCard}
      aria-label={
        card.image
          ? `그림: ${card.image.alt || "대체텍스트 없음"}`
          : "그림 넣기"
      }
      className="block w-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      {card.image ? (
        <Image
          src={card.image.src}
          alt={card.image.alt}
          width={320}
          height={240}
          unoptimized
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
      ) : (
        <span className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-2sm text-muted-foreground">
          <HugeiconsIcon icon={Image01Icon} strokeWidth={2} size={22} />
          그림 없음
        </span>
      )}
    </button>
  );

  return (
    <CardFrame
      id={cardElementId(card.id)}
      data-selected={selected || undefined}
      imageSlot={imageSlot}
      className={cn("group/card relative", selected && "ring-2 ring-primary")}
      label={<CardLabel role={card.role} partyName={card.partyName} />}
    >
      <button
        type="button"
        onClick={selectCard}
        aria-label="카드 선택"
        className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover/card:opacity-100 hover:bg-accent focus-visible:opacity-100 data-[selected]:opacity-100"
        data-selected={selected || undefined}
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} size={18} />
      </button>
      <ul className="flex flex-col gap-1">
        {card.sentences.map((sentence) => (
          <CanvasSentence key={sentence.id} id={sentence.id} />
        ))}
      </ul>
    </CardFrame>
  );
}

function CanvasSentence({ id }: { id: string }) {
  const store = useEditorStore();
  const sentence = useEditor(
    (state) => findSentence(state.value, id)?.sentence,
  );
  const glossary = useEditor((state) => state.value.glossary);
  const selected = useEditor(
    (state) =>
      state.selection?.type === "sentence" && state.selection.id === id,
  );
  const suggesting = useEditor(
    (state) =>
      state.selection?.type === "sentence" &&
      state.selection.id === id &&
      (state.tool === "simplify" || state.tool === "split"),
  );
  if (!sentence) return null;

  const status = [
    !sentence.verified && "원문과 대조 전",
    sentence.anchors.length === 0 && "원문 근거 없음",
    sentence.origin === "ai-suggestion" && "AI 수정안 적용",
  ].filter(Boolean);

  return (
    <li>
      <div
        id={sentenceElementId(id)}
        role="button"
        tabIndex={selected ? 0 : -1}
        aria-pressed={selected}
        data-sentence-id={id}
        onClick={() => store.getState().select({ type: "sentence", id })}
        onDoubleClick={() => store.getState().startEditing(id)}
        className={cn(
          "relative -mx-2 cursor-pointer rounded-lg px-2 py-1 leading-relaxed [word-break:keep-all] outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/40",
          selected &&
            "bg-primary/15 ring-2 ring-primary/70 hover:bg-primary/15",
          suggesting &&
            "outline-2 outline-offset-2 outline-primary outline-dashed",
        )}
      >
        {!sentence.verified && (
          <span
            aria-hidden="true"
            className="absolute top-[0.85em] -left-2.5 size-1.5 rounded-full bg-warning"
          />
        )}
        {sentence.text ? (
          <TermText
            text={sentence.text}
            terms={glossary}
            renderTerm={(_term, surface, key) => (
              <span
                key={key}
                className="underline decoration-foreground/40 decoration-dotted decoration-2 underline-offset-[5px]"
              >
                {surface}
              </span>
            )}
          />
        ) : (
          <span className="text-muted-foreground">(빈 문장)</span>
        )}
        {sentence.anchors.length === 0 && (
          <HugeiconsIcon
            icon={LinkBackwardIcon}
            strokeWidth={2}
            size={16}
            aria-hidden="true"
            className="ml-1.5 inline-block align-[-2px] text-warning"
          />
        )}
        {sentence.origin === "ai-suggestion" && (
          <HugeiconsIcon
            icon={AiMagicIcon}
            strokeWidth={2}
            size={16}
            aria-hidden="true"
            className="ml-1.5 inline-block align-[-2px] text-info"
          />
        )}
        {status.length > 0 && (
          <span className="sr-only">({status.join(", ")})</span>
        )}
      </div>
    </li>
  );
}

function CanvasGlossary() {
  const document = useEditor((state) => state.value);
  const entries = glossaryInReadingOrder(document);

  if (entries.length === 0) {
    return (
      <p className="ring-dashed rounded-2xl px-5 py-4 text-md text-muted-foreground ring-1 ring-hairline">
        아직 풀이한 말이 없어요. 문장을 고르고 [용어 설명 추가]를 눌러 보세요.
      </p>
    );
  }
  return (
    <dl className="flex flex-col divide-y divide-hairline rounded-2xl bg-card ring-1 ring-hairline">
      {entries.map(({ term, used }) => (
        <div key={term.id} className="flex flex-col gap-1 px-5 py-4">
          <dt className="flex items-center gap-2 font-bold">
            {term.term}
            {!used && (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-2sm font-semibold text-warning">
                문장에 없음
              </span>
            )}
          </dt>
          <dd className="leading-relaxed">{term.explanation}</dd>
        </div>
      ))}
    </dl>
  );
}
