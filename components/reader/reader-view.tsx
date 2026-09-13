"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { CardFrame, SectionHeading } from "@/components/document/card-frame";
import { CardLabel } from "@/components/document/card-label";
import { DISCLAIMER, DisclaimerBox } from "@/components/document/disclaimer";
import { TermText } from "@/components/document/term-text";
import { Button } from "@/components/ui/button";
import type { ReaderContent, ReaderSection } from "@/lib/domain/publication";
import {
  formatKoreanDate,
  readingPages,
  type ReadingPage,
} from "@/lib/domain/reading";
import { shouldIgnoreShortcut } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";

import { ReaderTerm } from "./reader-term";

const SIZES = [20, 24, 28] as const;
const SIZE_LABELS = ["보통", "크게", "아주 크게"];
const SIZE_KEY = "ihaerostudio-reader-size";

function readStoredSize() {
  try {
    const stored = Number(window.localStorage.getItem(SIZE_KEY));
    return stored >= 0 && stored < SIZES.length ? stored : 0;
  } catch {
    return 0;
  }
}

/**
 * What readers see: cover, then one section per screen with large text and
 * buttons (or everything at once), glossary words to tap, and the notice
 * that this is not the official judgment.
 */
export function ReaderView({
  content,
  embedded = false,
  className,
}: {
  content: ReaderContent;
  /** Inside the editor preview: no window-wide shortcuts. */
  embedded?: boolean;
  className?: string;
}) {
  const pages = readingPages(content);
  const [pageIndex, setPageIndex] = useState(0);
  const [mode, setMode] = useState<"page" | "all">("page");
  const [size, setSize] = useState(readStoredSize);
  const rootRef = useRef<HTMLDivElement>(null);
  const page = pages[Math.min(pageIndex, pages.length - 1)];
  const sectionCount = pages.filter((p) => p.type === "section").length;

  function go(delta: number) {
    setPageIndex((index) =>
      Math.max(0, Math.min(pages.length - 1, index + delta)),
    );
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (embedded) root.scrollTo({ top: 0 });
    else window.scrollTo({ top: 0 });
  }, [pageIndex, mode, embedded]);

  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (shouldIgnoreShortcut(event) || event.metaKey || event.altKey) return;
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  });
  useEffect(() => {
    if (embedded || mode !== "page") return;
    const listener = (event: KeyboardEvent) => onShortcut(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [embedded, mode]);

  function changeSize(next: number) {
    setSize(next);
    try {
      window.localStorage.setItem(SIZE_KEY, String(next));
    } catch {
      // Private mode: the size just does not persist.
    }
  }

  return (
    <div
      ref={rootRef}
      lang="ko"
      style={{ fontSize: SIZES[size] }}
      className={cn(
        "paper @container flex flex-col",
        embedded ? "h-full overflow-y-auto" : "min-h-svh",
        className,
      )}
    >
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-hairline bg-background/95 px-4 py-2 backdrop-blur">
        <p className="min-w-0 flex-1 truncate text-[0.75em] font-semibold">
          {content.title}
        </p>
        <div
          role="group"
          aria-label="글자 크기"
          className="flex rounded-full bg-secondary p-1"
        >
          {SIZES.map((value, index) => (
            <button
              key={value}
              type="button"
              aria-pressed={size === index}
              aria-label={`글자 크기 ${SIZE_LABELS[index]}`}
              onClick={() => changeSize(index)}
              className={cn(
                "flex size-10 items-center justify-center rounded-full font-bold",
                size === index
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
              style={{ fontSize: 14 + index * 4 }}
            >
              가
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          className="h-12 rounded-full px-4 text-[0.7em]"
          onClick={() => setMode(mode === "page" ? "all" : "page")}
        >
          {mode === "page" ? "한 번에 모두 보기" : "나눠서 보기"}
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-[42em] flex-1 flex-col px-5 pt-8 pb-12">
        {mode === "page" ? (
          <PageBody
            page={page}
            content={content}
            onStart={() => go(1)}
            onRestart={() => setPageIndex(0)}
          />
        ) : (
          <div className="flex flex-col gap-16">
            {pages.map((item, index) => (
              <PageBody
                key={index}
                page={item}
                content={content}
                showActions={false}
              />
            ))}
          </div>
        )}
      </main>

      {mode === "page" && (
        <nav
          aria-label="쪽 넘기기"
          className="sticky bottom-0 z-10 border-t border-hairline bg-background/95 px-4 py-3 backdrop-blur"
        >
          <div className="mx-auto flex max-w-[42em] items-center gap-3">
            <Button
              variant="secondary"
              className="h-14 flex-1 rounded-2xl text-[0.9em] @min-[40rem]:flex-none @min-[40rem]:px-6"
              disabled={pageIndex === 0}
              onClick={() => go(-1)}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                strokeWidth={2.2}
                className="size-[1.1em]"
              />
              이전
            </Button>
            <ol
              className="hidden flex-1 items-center justify-center gap-2 @min-[40rem]:flex"
              aria-label="진행"
            >
              {pages.map((item, index) => (
                <li
                  key={index}
                  aria-current={index === pageIndex ? "step" : undefined}
                  className={cn(
                    "size-2.5 rounded-full bg-foreground/20",
                    index === pageIndex && "w-6 bg-foreground",
                  )}
                />
              ))}
            </ol>
            <p className="min-w-16 text-center text-[0.8em] font-semibold tabular-nums @min-[40rem]:hidden">
              {page.type === "section"
                ? `${page.number} / ${sectionCount}`
                : page.type === "cover"
                  ? "처음"
                  : "끝"}
            </p>
            <Button
              className="h-14 flex-1 rounded-2xl text-[0.9em] @min-[40rem]:flex-none @min-[40rem]:px-6"
              disabled={pageIndex === pages.length - 1}
              onClick={() => go(1)}
            >
              다음
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2.2}
                className="size-[1.1em]"
              />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}

function PageBody({
  page,
  content,
  showActions = true,
  onStart,
  onRestart,
}: {
  page: ReadingPage;
  content: ReaderContent;
  showActions?: boolean;
  onStart?: () => void;
  onRestart?: () => void;
}) {
  if (page.type === "cover") {
    return (
      <section className="flex flex-col gap-6" aria-label="표지">
        <p className="text-[0.75em] font-bold text-primary-text">
          쉬운 설명자료
        </p>
        <h1 className="text-[1.75em] leading-tight font-bold tracking-tight [word-break:keep-all]">
          {content.title}
        </h1>
        <p className="text-[1em] leading-relaxed [word-break:keep-all] text-muted-foreground">
          {content.subtitle}
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-2xl bg-card p-4 text-[0.8em] ring-1 ring-hairline">
          <dt className="text-muted-foreground">법원</dt>
          <dd className="font-semibold">{content.overview.court}</dd>
          <dt className="text-muted-foreground">사건번호</dt>
          <dd className="font-semibold">{content.overview.caseNumber}</dd>
          <dt className="text-muted-foreground">판결한 날</dt>
          <dd className="font-semibold">
            {formatKoreanDate(content.overview.decisionDate)}
          </dd>
        </dl>
        <DisclaimerBox tone={content.tone} className="text-[0.85em]" />
        {showActions && (
          <Button className="h-14 rounded-2xl text-[1em]" onClick={onStart}>
            읽기 시작
          </Button>
        )}
      </section>
    );
  }

  if (page.type === "end") {
    return (
      <section className="flex flex-col gap-6" aria-label="마침">
        <h2 className="text-[1.5em] font-bold tracking-tight">
          끝까지 읽었어요
        </h2>
        <DisclaimerBox tone={content.tone} className="text-[0.85em]" />
        {showActions && (
          <Button
            variant="secondary"
            className="h-14 rounded-2xl text-[1em]"
            onClick={onRestart}
          >
            처음으로
          </Button>
        )}
      </section>
    );
  }

  const section = content.sections[page.sectionIndex];
  return (
    <section
      className="flex flex-col gap-6"
      aria-labelledby={`reader-section-${page.sectionIndex}`}
    >
      <SectionHeading number={page.number} className="text-[1em]">
        <h2
          id={`reader-section-${page.sectionIndex}`}
          className="text-[1.45em] leading-tight font-bold tracking-tight [word-break:keep-all]"
        >
          {section.title}
        </h2>
      </SectionHeading>
      <SectionBody section={section} content={content} />
      <p className="mt-4 text-center text-[0.7em] text-muted-foreground">
        {DISCLAIMER.short[content.tone]}
      </p>
    </section>
  );
}

function SectionBody({
  section,
  content,
}: {
  section: ReaderSection;
  content: ReaderContent;
}) {
  if (section.kind === "glossary") {
    return (
      <dl className="flex flex-col divide-y divide-hairline rounded-2xl bg-card ring-1 ring-hairline">
        {content.glossary.map((term) => (
          <div key={term.id} className="flex flex-col gap-1 px-5 py-4">
            <dt className="text-[1.05em] font-bold">{term.term}</dt>
            <dd className="leading-[1.7] [word-break:keep-all]">
              {term.explanation}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  const glossary = content.glossary.map((term) => ({ ...term }));
  return (
    <div className="flex flex-col gap-4">
      {section.cards.map((card) => (
        <CardFrame
          key={card.id}
          layout="responsive"
          image={card.image}
          className="gap-4 p-4 @min-[40rem]:gap-5 @min-[40rem]:p-5"
          label={
            <CardLabel
              role={card.role}
              partyName={card.partyName}
              className="text-[0.8em]"
            />
          }
        >
          <ul className="flex flex-col gap-[0.45em]">
            {card.sentences.map((sentence) => (
              <li
                key={sentence.id}
                className="leading-[1.7] [word-break:keep-all]"
              >
                <TermText
                  text={sentence.text}
                  terms={glossary}
                  renderTerm={(term, surface, key) => (
                    <ReaderTerm
                      key={key}
                      term={term.term}
                      explanation={term.explanation}
                      surface={surface}
                    />
                  )}
                />
              </li>
            ))}
          </ul>
        </CardFrame>
      ))}
    </div>
  );
}
