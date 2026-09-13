"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Link04Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import type { Anchor } from "@/lib/domain/common";
import { segmentText } from "@/lib/domain/segments";
import type { SourceDocument, SourceParagraph } from "@/lib/domain/source";
import { cn } from "@/lib/utils";

export interface SourceMark {
  /** Who relies on this anchor: a sentence or structure item id. */
  key: string;
  anchor: Anchor;
}

interface PendingSelection {
  anchor: Anchor;
  top: number;
  left: number;
}

function compareAnchors(order: Map<string, number>) {
  return (a: Anchor, b: Anchor) =>
    (order.get(a.paragraphId) ?? 0) - (order.get(b.paragraphId) ?? 0) ||
    a.start - b.start;
}

/** Character offsets of the DOM selection inside one paragraph, if any. */
function selectionAnchor(container: HTMLElement): {
  anchor: Anchor;
  rect: DOMRect;
} | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  const startEl = (
    range.startContainer instanceof Element
      ? range.startContainer
      : range.startContainer.parentElement
  )?.closest<HTMLElement>("[data-paragraph-text]");
  const endEl = (
    range.endContainer instanceof Element
      ? range.endContainer
      : range.endContainer.parentElement
  )?.closest<HTMLElement>("[data-paragraph-text]");
  if (!startEl || startEl !== endEl || !container.contains(startEl)) {
    return null;
  }
  const before = document.createRange();
  before.setStart(startEl, 0);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  const end = start + range.toString().length;
  if (end <= start) return null;
  return {
    anchor: { paragraphId: startEl.dataset.paragraphText!, start, end },
    rect: range.getBoundingClientRect(),
  };
}

export function SourceViewer({
  source,
  marks,
  activeKeys,
  onMarkClick,
  selectionLabel,
  onSelectionAction,
  className,
}: {
  source: SourceDocument;
  marks: SourceMark[];
  activeKeys: string[];
  onMarkClick?: (keys: string[]) => void;
  /** When set, selecting text offers a button that hands back its anchor. */
  selectionLabel?: string;
  onSelectionAction?: (anchor: Anchor) => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const activeSignature = activeKeys.join("|");
  const [focus, setFocus] = useState({ signature: activeSignature, index: 0 });
  const focusIndex = focus.signature === activeSignature ? focus.index : 0;

  const order = useMemo(
    () => new Map(source.paragraphs.map((p, index) => [p.id, index])),
    [source.paragraphs],
  );

  const activeAnchors = useMemo(() => {
    const active = new Set(activeKeys);
    return marks
      .filter((mark) => active.has(mark.key))
      .map((mark) => mark.anchor)
      .sort(compareAnchors(order));
  }, [marks, activeKeys, order]);

  const marksByParagraph = useMemo(() => {
    const grouped = new Map<string, SourceMark[]>();
    for (const mark of marks) {
      const list = grouped.get(mark.anchor.paragraphId) ?? [];
      list.push(mark);
      grouped.set(mark.anchor.paragraphId, list);
    }
    return grouped;
  }, [marks]);

  const sections = useMemo(
    () =>
      source.paragraphs.filter(
        (p) => p.kind === "heading" && p.level !== null && p.level <= 2,
      ),
    [source.paragraphs],
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || activeAnchors.length === 0) return;
    const target = container.querySelector<HTMLElement>(
      `[data-active-anchor~="${focusIndex}"]`,
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target?.scrollIntoView({
      block: "center",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeAnchors, focusIndex]);

  function handleMouseUp() {
    if (!selectionLabel || !onSelectionAction) return;
    const container = scrollRef.current;
    if (!container) return;
    const found = selectionAnchor(container);
    if (!found) {
      setPending(null);
      return;
    }
    const box = container.getBoundingClientRect();
    setPending({
      anchor: found.anchor,
      top: found.rect.bottom - box.top + container.scrollTop + 6,
      left: Math.max(
        8,
        Math.min(
          found.rect.left - box.left + found.rect.width / 2 - 110,
          box.width - 228,
        ),
      ),
    });
  }

  function jumpTo(paragraph: SourceParagraph) {
    scrollRef.current
      ?.querySelector(`[data-paragraph="${paragraph.id}"]`)
      ?.scrollIntoView({ block: "start" });
  }

  return (
    <section
      aria-label="원문 판결문"
      className={cn("flex h-full min-h-0 flex-col bg-card", className)}
    >
      <div className="flex shrink-0 flex-col gap-2 border-b border-hairline px-4 pt-3 pb-2">
        <div className="flex h-7 items-center justify-between gap-2">
          <h2 className="text-sm font-bold">원문 판결문</h2>
          {activeAnchors.length > 1 && (
            <div className="flex items-center gap-1 text-2sm text-muted-foreground">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="이전 근거"
                onClick={() =>
                  setFocus({
                    signature: activeSignature,
                    index:
                      (focusIndex - 1 + activeAnchors.length) %
                      activeAnchors.length,
                  })
                }
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
              </Button>
              <span className="tabular-nums" aria-live="polite">
                근거 {focusIndex + 1}/{activeAnchors.length}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="다음 근거"
                onClick={() =>
                  setFocus({
                    signature: activeSignature,
                    index: (focusIndex + 1) % activeAnchors.length,
                  })
                }
              >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Button>
            </div>
          )}
        </div>
        <nav aria-label="원문 구획" className="-mx-1 overflow-x-auto">
          <ul className="flex w-max gap-1 px-1 pb-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => jumpTo(section)}
                  className={cn(
                    "h-7 rounded-full px-2.5 text-2sm whitespace-nowrap text-muted-foreground ring-1 ring-hairline hover:bg-accent hover:text-foreground",
                    section.level === 1 && "font-semibold text-foreground",
                  )}
                >
                  {section.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        ref={scrollRef}
        onMouseUp={handleMouseUp}
        onMouseDown={(event) => {
          // Pressing the action button itself must not dismiss it first.
          if (
            (event.target as HTMLElement).closest("[data-selection-action]")
          ) {
            return;
          }
          setPending(null);
        }}
        className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5"
      >
        <article className="mx-auto flex max-w-[40em] flex-col gap-2.5 text-md leading-7 [word-break:keep-all]">
          {source.paragraphs.map((paragraph, index) => (
            <Paragraph
              showPage={
                paragraph.page !== null &&
                source.paragraphs[index - 1]?.page !== paragraph.page
              }
              key={paragraph.id}
              paragraph={paragraph}
              marks={marksByParagraph.get(paragraph.id) ?? []}
              activeKeys={activeKeys}
              activeAnchors={activeAnchors}
              focusIndex={focusIndex}
              onMarkClick={onMarkClick}
            />
          ))}
        </article>

        {pending && selectionLabel && onSelectionAction && (
          <div
            data-selection-action
            className="absolute z-10 w-56"
            style={{ top: pending.top, left: pending.left }}
          >
            <Button
              size="sm"
              variant="neutral"
              className="w-full shadow-popover"
              onMouseDown={(event: ReactMouseEvent) => event.preventDefault()}
              onClick={() => {
                onSelectionAction(pending.anchor);
                setPending(null);
                window.getSelection()?.removeAllRanges();
              }}
            >
              <HugeiconsIcon
                icon={Link04Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {selectionLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function Paragraph({
  paragraph,
  showPage,
  marks,
  activeKeys,
  activeAnchors,
  focusIndex,
  onMarkClick,
}: {
  paragraph: SourceParagraph;
  showPage: boolean;
  marks: SourceMark[];
  activeKeys: string[];
  activeAnchors: Anchor[];
  focusIndex: number;
  onMarkClick?: (keys: string[]) => void;
}) {
  const segments = segmentText(
    paragraph.text,
    marks.map((mark) => ({
      start: mark.anchor.start,
      end: mark.anchor.end,
      key: mark.key,
    })),
  );
  const active = new Set(activeKeys);

  const heading = paragraph.kind === "heading";
  return (
    <div
      data-paragraph={paragraph.id}
      className={cn(
        "group/paragraph relative scroll-mt-4",
        heading &&
          paragraph.level === 1 &&
          "mt-5 text-center text-lg font-bold tracking-[0.3em]",
        heading && paragraph.level === 2 && "mt-4 font-bold",
        heading && paragraph.level === 3 && "mt-2 font-semibold",
        paragraph.block === "header" &&
          !heading &&
          "text-2sm leading-6 text-muted-foreground",
      )}
    >
      {showPage && (
        <div
          aria-hidden="true"
          className="mb-2 flex items-center gap-2 text-[11px] font-normal tracking-normal text-muted-foreground"
        >
          <span className="h-px flex-1 bg-hairline" />
          {paragraph.page}쪽
          <span className="h-px flex-1 bg-hairline" />
        </div>
      )}
      <p data-paragraph-text={paragraph.id}>
        {segments.map((segment) => {
          if (segment.keys.length === 0) {
            return <span key={segment.start}>{segment.text}</span>;
          }
          const isActive = segment.keys.some((key) => active.has(key));
          const anchorIndexes = activeAnchors
            .map((anchor, index) =>
              anchor.paragraphId === paragraph.id &&
              anchor.start <= segment.start &&
              anchor.end >= segment.end
                ? index
                : -1,
            )
            .filter((index) => index !== -1);
          const focused = anchorIndexes.includes(focusIndex);
          return (
            <mark
              key={segment.start}
              data-active-anchor={
                isActive ? anchorIndexes.join(" ") || undefined : undefined
              }
              onClick={
                onMarkClick ? () => onMarkClick(segment.keys) : undefined
              }
              className={cn(
                "rounded-[3px] text-foreground",
                isActive
                  ? focused
                    ? "bg-primary/45 shadow-[0_0_0_2px_var(--primary)]"
                    : "bg-primary/25"
                  : "bg-transparent underline decoration-foreground/25 decoration-dotted underline-offset-4",
                onMarkClick && "cursor-pointer hover:bg-primary/15",
              )}
            >
              {segment.text}
            </mark>
          );
        })}
      </p>
    </div>
  );
}
