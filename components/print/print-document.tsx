"use client";

import {
  Fragment,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";

import { SectionHeading } from "@/components/document/card-frame";
import { CardLabel } from "@/components/document/card-label";
import { DISCLAIMER } from "@/components/document/disclaimer";
import {
  numberPages,
  paginate,
  type NumberedPage,
  type PrintBlock,
} from "@/lib/domain/pagination";
import type { ReaderCard, ReaderContent } from "@/lib/domain/publication";
import { formatKoreanDate } from "@/lib/domain/reading";
import { cn } from "@/lib/utils";

/** A4 geometry in millimetres; the page body excludes margins and footer. */
const PAGE = { width: 210, height: 297, margin: 16, footer: 10, band: 9 };
const GAP_MM = 5;
const MM_TO_PX = 96 / 25.4;

interface Block extends PrintBlock {
  node: ReactNode;
}

function CoverBlock({ content }: { content: ReaderContent }) {
  return (
    <div className="flex flex-col gap-[7mm] pt-[20mm]">
      <p className="text-[12pt] font-bold text-primary-text">쉬운 설명자료</p>
      <h1 className="text-[28pt] leading-tight font-bold tracking-tight break-keep">
        {content.title}
      </h1>
      <p className="text-[15pt] leading-normal break-keep text-muted-foreground">
        {content.subtitle}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-[6mm] gap-y-[2mm] rounded-[4mm] border-[0.3mm] border-border p-[5mm] text-[12pt]">
        <dt className="text-muted-foreground">법원</dt>
        <dd className="font-semibold">{content.overview.court}</dd>
        <dt className="text-muted-foreground">사건번호</dt>
        <dd className="font-semibold">{content.overview.caseNumber}</dd>
        <dt className="text-muted-foreground">판결한 날</dt>
        <dd className="font-semibold">
          {formatKoreanDate(content.overview.decisionDate)}
        </dd>
      </dl>
      <p className="rounded-[4mm] border-[0.5mm] border-info/40 bg-info/5 p-[5mm] text-[13pt] leading-[1.6] font-medium break-keep">
        {DISCLAIMER.long[content.tone]}
      </p>
    </div>
  );
}

function PrintCard({ card }: { card: ReaderCard }) {
  return (
    <article className="flex gap-[6mm] rounded-[4mm] border-[0.3mm] border-border p-[5mm]">
      {card.image && (
        <Image
          src={card.image.src}
          alt={card.image.alt}
          width={320}
          height={240}
          unoptimized
          loading="eager"
          className="aspect-4/3 w-[35%] shrink-0 self-start rounded-[3mm] object-cover"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-[3mm]">
        <CardLabel
          role={card.role}
          partyName={card.partyName}
          className="border-[0.3mm] border-current text-[11pt]"
        />
        <ul className="flex flex-col gap-[2mm]">
          {card.sentences.map((sentence) => (
            <li
              key={sentence.id}
              className="text-[16pt] leading-[1.6] break-keep"
            >
              {sentence.text}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function buildBlocks(content: ReaderContent): Block[] {
  const blocks: Block[] = [
    { id: "cover", height: 0, node: <CoverBlock content={content} /> },
  ];
  let number = 0;
  content.sections.forEach((section, sectionIndex) => {
    const isGlossary = section.kind === "glossary";
    if (
      isGlossary ? content.glossary.length === 0 : section.cards.length === 0
    ) {
      return;
    }
    number += 1;
    blocks.push({
      id: `section-${sectionIndex}`,
      height: 0,
      startsPage: true,
      keepWithNext: true,
      node: (
        <SectionHeading number={number} className="text-[22pt]">
          <h2 className="text-[22pt] leading-tight font-bold tracking-tight">
            {section.title}
          </h2>
        </SectionHeading>
      ),
    });
    if (isGlossary) {
      for (const term of content.glossary) {
        blocks.push({
          id: `term-${term.id}`,
          height: 0,
          node: (
            <dl className="grid grid-cols-[35mm_1fr] gap-[5mm] border-b-[0.3mm] border-border pb-[3mm] text-[14pt] leading-[1.6] break-keep">
              <dt className="font-bold">{term.term}</dt>
              <dd>{term.explanation}</dd>
            </dl>
          ),
        });
      }
    } else {
      for (const card of section.cards) {
        blocks.push({
          id: `card-${card.id}`,
          height: 0,
          node: <PrintCard card={card} />,
        });
      }
    }
  });
  return blocks;
}

function waitForAssets(root: HTMLElement) {
  const images = [...root.querySelectorAll("img")].map((image) =>
    image.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
  );
  // Heights do not depend on pictures (their box has a fixed ratio), so a slow
  // picture only delays printing, never the layout, beyond this cap.
  const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
  return Promise.race([
    Promise.all([document.fonts.ready, ...images]),
    timeout,
  ]);
}

/**
 * The printable A4 version of reader content. Blocks are measured at print
 * width, packed into pages, and rendered as fixed-size sheets that the
 * preview shows scaled and the print route sends to the printer.
 */
export function PrintDocument({
  content,
  draft,
  zoom = 1,
  onReady,
}: {
  content: ReaderContent;
  /** Not reviewed: every page carries a "draft, do not distribute" band. */
  draft: boolean;
  zoom?: number;
  onReady?: (pageCount: number) => void;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<NumberedPage[] | null>(null);
  const blocks = useMemo(() => buildBlocks(content), [content]);
  const byId = new Map(blocks.map((block) => [block.id, block]));
  const reportReady = useEffectEvent((pageCount: number) =>
    onReady?.(pageCount),
  );

  useEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    let cancelled = false;
    void waitForAssets(root).then(() => {
      if (cancelled) return;
      const measured: PrintBlock[] = blocks.map((block) => {
        const element = root.querySelector<HTMLElement>(
          `[data-block="${block.id}"]`,
        );
        return {
          id: block.id,
          startsPage: block.startsPage,
          keepWithNext: block.keepWithNext,
          height: element?.getBoundingClientRect().height ?? 0,
        };
      });
      const bodyHeight =
        (PAGE.height -
          PAGE.margin * 2 -
          PAGE.footer -
          (draft ? PAGE.band : 0)) *
        MM_TO_PX;
      const result = paginate(measured, {
        pageHeight: bodyHeight,
        gap: GAP_MM * MM_TO_PX,
      });
      setPages(numberPages(result));
      reportReady(result.length);
    });
    return () => {
      cancelled = true;
    };
  }, [blocks, draft]);

  return (
    <>
      <div
        ref={measureRef}
        aria-hidden="true"
        className="paper pointer-events-none invisible absolute top-0 left-[-10000px] print:hidden"
        style={{ width: `${PAGE.width - PAGE.margin * 2}mm` }}
      >
        {blocks.map((block) => (
          <div key={block.id} data-block={block.id}>
            {block.node}
          </div>
        ))}
      </div>

      <div
        className="flex flex-col items-center gap-[8mm] print:block print:gap-0"
        style={{ zoom }}
      >
        {pages?.map((page) => (
          <section
            key={page.number}
            aria-label={`${page.number}쪽`}
            className="print-page paper relative flex shrink-0 flex-col overflow-hidden bg-background shadow-dialog ring-1 ring-hairline print:shadow-none print:ring-0"
            style={{
              width: `${PAGE.width}mm`,
              height: `${PAGE.height}mm`,
              padding: `${PAGE.margin}mm`,
            }}
          >
            {draft && (
              <p
                className="mb-[3mm] flex h-[6mm] shrink-0 items-center justify-center rounded-[2mm] border-[0.4mm] border-destructive text-[10pt] font-bold text-destructive"
                style={{ height: `${PAGE.band - 3}mm` }}
              >
                검토 전 초안 · 배포하지 마세요
              </p>
            )}
            <div
              className="flex min-h-0 flex-1 flex-col"
              style={{ gap: `${GAP_MM}mm` }}
            >
              {page.blockIds.map((id) => (
                <Fragment key={id}>{byId.get(id)?.node}</Fragment>
              ))}
            </div>
            <footer
              className={cn(
                "flex shrink-0 items-end justify-between text-[9pt] text-muted-foreground",
              )}
              style={{ height: `${PAGE.footer}mm` }}
            >
              <span>{DISCLAIMER.short[content.tone]}</span>
              <span className="tabular-nums">{page.label}</span>
            </footer>
          </section>
        ))}
      </div>
    </>
  );
}
