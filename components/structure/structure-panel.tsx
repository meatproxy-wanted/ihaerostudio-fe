"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  BubbleChatIcon,
  CourtHouseIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addItem, countFlags } from "@/lib/domain/structure-ops";
import type { StructureList } from "@/lib/domain/structure-ops";
import { newClientId } from "@/lib/ids";
import { cn } from "@/lib/utils";

import {
  ClaimItem,
  DecisionItem,
  FindingItem,
  KeyFactItem,
  OverviewFields,
  PartyItem,
} from "./structure-items";
import { useStructure, useStructureStore } from "./structure-store";

/** Distinct, non-color-only markers for each party's claims. */
export const PARTY_DOTS = [
  "bg-negative",
  "bg-warning",
  "bg-success",
  "bg-chart-3",
];

const SECTIONS = [
  { id: "overview", label: "사건 정보" },
  { id: "parties", label: "등장인물" },
  { id: "facts", label: "핵심 사실" },
  { id: "claims", label: "주장" },
  { id: "court", label: "법원의 판단·결정" },
];

function newItemId(list: StructureList) {
  return newClientId(list);
}

function useAdd() {
  const store = useStructureStore();
  return (list: StructureList, options: { partyId?: string } = {}) => {
    const id = newItemId(list);
    store
      .getState()
      .apply((structure) => addItem(structure, list, id, options));
    store.getState().select({ list, id });
    requestAnimationFrame(() => {
      const element = document.getElementById(`structure-item-${id}`);
      element?.scrollIntoView({ block: "center" });
      element?.querySelector<HTMLElement>("input, textarea")?.focus();
    });
  };
}

function Section({
  id,
  title,
  description,
  action,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={`structure-${id}`} className="scroll-mt-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-md font-bold">{title}</h3>
          {description && (
            <p className="text-2sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

function AddButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <HugeiconsIcon
        icon={Add01Icon}
        strokeWidth={2}
        data-icon="inline-start"
      />
      {children}
    </Button>
  );
}

export function StructurePanel({
  hasDraft,
  sourceToggle,
  settingsButton,
  confirmCard,
  footer,
}: {
  hasDraft: boolean;
  sourceToggle: ReactNode;
  settingsButton: ReactNode;
  /** Sits at the end of the list, after everything there is to read. */
  confirmCard: ReactNode;
  footer: ReactNode;
}) {
  const structure = useStructure((state) => state.value);
  const add = useAdd();
  const flagCount = countFlags(structure);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [here, setHere] = useState(SECTIONS[0].id);

  /*
    Which section the list is showing, so the tab bar can mark it. Tabs that
    never light up read as broken, and marking whichever one was last
    clicked would lie the moment the producer scrolls on. The current one is
    the last section heading to have passed the top of the pane.
  */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let frame = 0;
    const update = () => {
      frame = 0;

      /*
        The last section can never reach the top of the pane — there is not
        enough below it to scroll it up there — so without this the tab you
        just clicked hands the mark straight back to the one above it. At
        the bottom of the scroll, the last section is where you are.
      */
      const atBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 8;
      if (atBottom) {
        setHere(SECTIONS[SECTIONS.length - 1].id);
        return;
      }

      /*
        The threshold has to clear the sections' `scroll-mt`: an anchor
        jump parks the target that far below the top, and a line drawn any
        higher would read the section you just asked for as "not reached
        yet" and mark the one above it instead.
      */
      const top = container.getBoundingClientRect().top;
      let current = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const element = container.querySelector<HTMLElement>(
          `#structure-${section.id}`,
        );
        if (!element) continue;
        if (element.getBoundingClientRect().top - top > 24) break;
        current = section.id;
      }
      setHere(current);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/*
        No surface of its own: the header sits on the pane's background and
        the rule under it is gone, so this side reads as one continuous
        area. The white belongs to the source pane opposite, which is a
        document; this side is the app working on it.
      */}
      <div className="z-10 shrink-0 px-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">사건 구조 확인</h2>
            <p className="text-2sm text-muted-foreground">
              AI가 정리한 초안이에요. 왼쪽 원문과 비교하며 틀린 부분을 고쳐
              주세요.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {sourceToggle}
            {flagCount > 0 && (
              <Badge variant="warning" size="lg">
                확인 필요 {flagCount}
              </Badge>
            )}
            {settingsButton}
          </div>
        </div>
        {/*
          Tabs to look at, links to use: clicking one scrolls the list to
          that section rather than swapping panels, so it stays a `nav` of
          anchors. Real tabs would promise that the other five are put away,
          and this screen ends in a tick saying every one of them was read.
        */}
        {/* Same width as the list below it — capped and centred — so the
            rail begins and ends where the content does. */}
        <nav
          aria-label="사건 구조 구획"
          className="mx-auto mt-3 no-scrollbar w-full max-w-3xl"
        >
          {/* The tabs divide the width between them rather than hugging
              their labels, and the row sits on the header's bottom edge, so
              the underline is the seam between the bar and the list it is
              pointing into. */}
          {/* The grey rail is one line on the list, not a border per tab:
              drawn per tab it breaks at every seam where the widths land on
              a fraction. The active tab is pulled down over it. */}
          <ul className="flex w-full border-b-2 border-hairline">
            {SECTIONS.map((section) => (
              <li key={section.id} className="min-w-0 flex-auto">
                <a
                  href={`#structure-${section.id}`}
                  aria-current={section.id === here ? "location" : undefined}
                  onClick={() => setHere(section.id)}
                  className={cn(
                    "-mb-0.5 flex h-11 items-center justify-center border-b-2 px-3 text-center text-sm transition-colors",
                    section.id === here
                      ? "border-primary font-semibold text-foreground"
                      : "border-hairline text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="truncate">{section.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-9 px-5 pt-5 pb-10">
          {hasDraft && (
            <Alert role="note" variant="info">
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
              <AlertTitle>초안이 이미 있어요</AlertTitle>
              <AlertDescription>
                여기서 고친 내용은 초안을 다시 만들어야 결과물에 반영돼요.
                편집한 초안은 자동으로 바뀌지 않아요.
              </AlertDescription>
            </Alert>
          )}

          <Section id="overview" title="사건 정보">
            <OverviewFields />
          </Section>

          <Section
            id="parties"
            title="등장인물"
            description="호칭은 결과물에서 인물을 부르는 이름이에요."
            action={
              <AddButton onClick={() => add("parties")}>인물 추가</AddButton>
            }
          >
            {structure.parties.map((party) => (
              <PartyItem key={party.id} party={party} />
            ))}
          </Section>

          <Section
            id="facts"
            title="핵심 사실"
            description="금액과 날짜는 검토할 때 쉬운 자료와 대조하는 기준이 돼요."
            action={
              <AddButton onClick={() => add("keyFacts")}>사실 추가</AddButton>
            }
          >
            {structure.keyFacts.map((fact) => (
              <KeyFactItem key={fact.id} fact={fact} />
            ))}
          </Section>

          <Zone
            id="claims"
            tone="claims"
            icon={BubbleChatIcon}
            title="당사자가 주장한 내용"
            note="주장은 당사자가 한 말이에요. 법원이 인정한 사실이 아니에요."
          >
            {structure.parties.map((party, index) => {
              const claims = structure.claims.filter(
                (claim) => claim.partyId === party.id,
              );
              return (
                <div key={party.id} className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-2.5 rounded-full",
                          PARTY_DOTS[index % PARTY_DOTS.length],
                        )}
                      />
                      {party.displayName || "이름 없는 인물"}의 주장
                    </p>
                    <AddButton
                      onClick={() => add("claims", { partyId: party.id })}
                    >
                      주장 추가
                    </AddButton>
                  </div>
                  {claims.length === 0 && (
                    <p className="rounded-xl border border-dashed border-border px-3 py-2 text-2sm text-muted-foreground">
                      아직 주장이 없어요.
                    </p>
                  )}
                  {claims.map((claim) => (
                    <ClaimItem key={claim.id} claim={claim} />
                  ))}
                </div>
              );
            })}
            {structure.claims
              .filter(
                (claim) =>
                  !structure.parties.some(
                    (party) => party.id === claim.partyId,
                  ),
              )
              .map((claim) => (
                <ClaimItem key={claim.id} claim={claim} />
              ))}
          </Zone>

          <Zone
            id="court"
            tone="court"
            icon={CourtHouseIcon}
            title="법원이 판단하고 결정한 내용"
            note="법원이 인정했거나 결정한 내용만 넣어요."
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">법원의 판단</p>
                <AddButton onClick={() => add("findings")}>판단 추가</AddButton>
              </div>
              {structure.findings.map((finding) => (
                <FindingItem key={finding.id} finding={finding} />
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">최종 결정 (주문)</p>
                <AddButton onClick={() => add("decisions")}>
                  결정 추가
                </AddButton>
              </div>
              {structure.decisions.map((decision) => (
                <DecisionItem key={decision.id} decision={decision} />
              ))}
            </div>
          </Zone>
          {/* The tick and the action it unlocks, closer to each other than
              to the structure above them. */}
          <div className="flex flex-col gap-4">
            {confirmCard}
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

function Zone({
  id,
  tone,
  icon,
  title,
  note,
  children,
}: {
  id: string;
  tone: "claims" | "court";
  icon: typeof BubbleChatIcon;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section
      id={`structure-${id}`}
      className={cn(
        "flex scroll-mt-4 flex-col gap-5 rounded-2xl p-4",
        tone === "claims"
          ? "bg-info/5 ring-1 ring-info/20"
          : "bg-primary/6 ring-1 ring-primary/25",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            tone === "claims"
              ? "bg-info/15 text-info"
              : "bg-primary/20 text-primary-text",
          )}
        >
          <HugeiconsIcon icon={icon} strokeWidth={2} size={20} />
        </span>
        <div>
          <h3 className="text-md font-bold">{title}</h3>
          <p className="text-2sm text-muted-foreground">{note}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
