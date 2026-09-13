"use client";

import type { ReactNode } from "react";
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
    <section id={`structure-${id}`} className="scroll-mt-28">
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
  settingsButton,
  footer,
}: {
  hasDraft: boolean;
  settingsButton: ReactNode;
  footer: ReactNode;
}) {
  const structure = useStructure((state) => state.value);
  const add = useAdd();
  const flagCount = countFlags(structure);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="z-10 shrink-0 border-b border-hairline bg-background/95 px-5 pt-4 pb-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">사건 구조 확인</h2>
            <p className="text-2sm text-muted-foreground">
              AI가 정리한 초안이에요. 왼쪽 원문과 비교하며 틀린 부분을 고쳐
              주세요.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {flagCount > 0 && (
              <Badge variant="warning" size="lg">
                확인 필요 {flagCount}
              </Badge>
            )}
            {settingsButton}
          </div>
        </div>
        <nav aria-label="사건 구조 구획" className="mt-3">
          <ul className="flex flex-wrap gap-1">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#structure-${section.id}`}
                  className="inline-flex h-7 items-center rounded-full px-2.5 text-2sm text-muted-foreground ring-1 ring-hairline hover:bg-accent hover:text-foreground"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
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

          {footer}
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
        "flex scroll-mt-28 flex-col gap-5 rounded-2xl p-4",
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
