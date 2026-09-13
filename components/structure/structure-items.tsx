"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { withParticle } from "@/lib/domain/korean";
import {
  FINDING_STANCE_LABELS,
  KEY_FACT_KIND_LABELS,
  type CaseStructure,
  type Claim,
  type Decision,
  type Finding,
  type FindingStance,
  type KeyFact,
  type KeyFactKind,
  type Party,
} from "@/lib/domain/structure";
import {
  moveItem,
  updateItem,
  updateOverview,
  type StatementList,
} from "@/lib/domain/structure-ops";

import { ItemShell } from "./item-shell";
import { useStructure, useStructureStore } from "./structure-store";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-2sm font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function useApply() {
  const store = useStructureStore();
  return (recipe: (structure: CaseStructure) => CaseStructure) =>
    store.getState().apply(recipe);
}

export function OverviewFields() {
  const overview = useStructure((state) => state.value.overview);
  const apply = useApply();
  const set = (key: keyof typeof overview) => (value: string) =>
    apply((structure) => updateOverview(structure, { [key]: value }));

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl bg-card p-3 ring-1 ring-hairline">
      <Field label="사건명">
        <Input
          value={overview.caseName}
          onChange={(event) => set("caseName")(event.target.value)}
        />
      </Field>
      <Field label="사건번호">
        <Input
          value={overview.caseNumber}
          onChange={(event) => set("caseNumber")(event.target.value)}
        />
      </Field>
      <Field label="법원">
        <Input
          value={overview.court}
          onChange={(event) => set("court")(event.target.value)}
        />
      </Field>
      <Field label="선고일">
        <Input
          type="date"
          value={overview.decisionDate}
          onChange={(event) => set("decisionDate")(event.target.value)}
        />
      </Field>
    </div>
  );
}

export function PartyItem({ party }: { party: Party }) {
  const apply = useApply();
  const ref = { list: "parties" as const, id: party.id };
  const update = (patch: Partial<Party>) =>
    apply((structure) => updateItem(structure, ref, patch));

  return (
    <ItemShell
      itemRef={ref}
      flags={party.flags}
      anchors={party.anchors}
      removeLabel={`${party.displayName || "인물"} 지우기`}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="호칭 (결과물에 쓰는 이름)">
          <Input
            value={party.displayName}
            placeholder="예: A씨"
            onChange={(event) => update({ displayName: event.target.value })}
          />
        </Field>
        <Field label="쉬운 역할 설명">
          <Input
            value={party.easyRole}
            placeholder="예: 집을 빌린 사람"
            onChange={(event) => update({ easyRole: event.target.value })}
          />
        </Field>
        <Field label="판결문 표기">
          <Input
            size="sm"
            value={party.sourceLabel}
            placeholder="예: 원고 A"
            onChange={(event) => update({ sourceLabel: event.target.value })}
          />
        </Field>
        <Field label="법적 지위">
          <Input
            size="sm"
            value={party.legalStatus}
            placeholder="예: 원고"
            onChange={(event) => update({ legalStatus: event.target.value })}
          />
        </Field>
      </div>
    </ItemShell>
  );
}

export function KeyFactItem({ fact }: { fact: KeyFact }) {
  const apply = useApply();
  const ref = { list: "keyFacts" as const, id: fact.id };
  const update = (patch: Partial<KeyFact>) =>
    apply((structure) => updateItem(structure, ref, patch));

  return (
    <ItemShell
      itemRef={ref}
      flags={fact.flags}
      anchors={fact.anchors}
      removeLabel="핵심 사실 지우기"
    >
      <div className="grid grid-cols-[auto_1fr_1fr] items-end gap-3">
        <Field label="종류">
          <NativeSelect
            value={fact.kind}
            onChange={(event) =>
              update({ kind: event.target.value as KeyFactKind })
            }
          >
            {Object.entries(KEY_FACT_KIND_LABELS).map(([value, label]) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field label="이름">
          <Input
            value={fact.label}
            placeholder="예: 임대차보증금"
            onChange={(event) => update({ label: event.target.value })}
          />
        </Field>
        <Field label="값">
          <Input
            value={fact.value}
            placeholder="예: 1억 원"
            onChange={(event) => update({ value: event.target.value })}
          />
        </Field>
      </div>
    </ItemShell>
  );
}

const DESTINATION_LABELS: Record<StatementList, string> = {
  claims: "주장",
  findings: "법원의 판단으로",
  decisions: "최종 결정으로",
};

function MoveMenu({ from, id }: { from: StatementList; id: string }) {
  const apply = useApply();
  const parties = useStructure((state) => state.value.parties);

  const destinations: {
    key: string;
    label: string;
    to: Parameters<typeof moveItem>[2];
  }[] = [];
  if (from !== "claims") {
    for (const party of parties) {
      destinations.push({
        key: `claims:${party.id}`,
        label: `${withParticle(party.displayName || "이름 없는 인물", "이/가")} 한 주장으로`,
        to: { list: "claims", partyId: party.id },
      });
    }
  }
  for (const list of ["findings", "decisions"] as const) {
    if (list !== from) {
      destinations.push({
        key: list,
        label: DESTINATION_LABELS[list],
        to: { list },
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="xs" className="text-muted-foreground" />
        }
      >
        <HugeiconsIcon
          icon={ArrowDataTransferHorizontalIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        옮기기
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>다른 목록으로 옮기기</DropdownMenuLabel>
          {destinations.map((destination) => (
            <DropdownMenuItem
              key={destination.key}
              onClick={() =>
                apply((structure) =>
                  moveItem(structure, { list: from, id }, destination.to),
                )
              }
            >
              {destination.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatementText({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <Textarea
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-0 resize-none border-transparent bg-transparent px-1 py-0.5 text-md leading-relaxed hover:border-input focus-visible:border-primary"
    />
  );
}

export function ClaimItem({ claim }: { claim: Claim }) {
  const apply = useApply();
  const parties = useStructure((state) => state.value.parties);
  const ref = { list: "claims" as const, id: claim.id };
  const hasParty = parties.some((party) => party.id === claim.partyId);
  return (
    <ItemShell
      itemRef={ref}
      flags={claim.flags}
      anchors={claim.anchors}
      menu={<MoveMenu from="claims" id={claim.id} />}
      removeLabel="주장 지우기"
    >
      <StatementText
        value={claim.text}
        placeholder="당사자가 주장한 내용"
        onChange={(text) =>
          apply((structure) => updateItem(structure, ref, { text }))
        }
      />
      <Field label="누구의 주장인가요" className="mt-2 block">
        <NativeSelect
          size="sm"
          value={hasParty ? claim.partyId : ""}
          aria-invalid={!hasParty || undefined}
          onChange={(event) =>
            apply((structure) =>
              updateItem(structure, ref, { partyId: event.target.value }),
            )
          }
        >
          {!hasParty && (
            <NativeSelectOption value="" disabled>
              인물을 골라 주세요
            </NativeSelectOption>
          )}
          {parties.map((party) => (
            <NativeSelectOption key={party.id} value={party.id}>
              {party.displayName || "이름 없는 인물"}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
    </ItemShell>
  );
}

export function FindingItem({ finding }: { finding: Finding }) {
  const apply = useApply();
  const claims = useStructure((state) => state.value.claims);
  const parties = useStructure((state) => state.value.parties);
  const ref = { list: "findings" as const, id: finding.id };
  const update = (patch: Partial<Finding>) =>
    apply((structure) => updateItem(structure, ref, patch));
  const partyName = (partyId: string) =>
    parties.find((party) => party.id === partyId)?.displayName ?? "인물 없음";

  return (
    <ItemShell
      itemRef={ref}
      flags={finding.flags}
      anchors={finding.anchors}
      menu={<MoveMenu from="findings" id={finding.id} />}
      removeLabel="판단 지우기"
    >
      <StatementText
        value={finding.text}
        placeholder="법원이 판단한 내용"
        onChange={(text) => update({ text })}
      />
      <div className="mt-2 grid grid-cols-[1fr_auto] items-start gap-3">
        <fieldset className="min-w-0">
          <legend className="mb-1 text-2sm font-medium text-muted-foreground">
            어느 주장에 대한 판단인가요
          </legend>
          {claims.length === 0 ? (
            <p className="text-2sm text-muted-foreground">주장이 없어요.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {claims.map((claim) => (
                <li key={claim.id}>
                  <label className="flex items-start gap-2 text-2sm">
                    <Checkbox
                      className="mt-0.5"
                      checked={finding.claimIds.includes(claim.id)}
                      onCheckedChange={(checked) =>
                        update({
                          claimIds: checked
                            ? [...finding.claimIds, claim.id]
                            : finding.claimIds.filter((id) => id !== claim.id),
                        })
                      }
                    />
                    <span className="line-clamp-2">
                      <span className="font-semibold">
                        {partyName(claim.partyId)}
                      </span>{" "}
                      · {claim.text || "(빈 주장)"}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
        <Field label="받아들임">
          <NativeSelect
            size="sm"
            value={finding.stance}
            onChange={(event) =>
              update({ stance: event.target.value as FindingStance })
            }
          >
            {Object.entries(FINDING_STANCE_LABELS).map(([value, label]) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </div>
    </ItemShell>
  );
}

export function DecisionItem({ decision }: { decision: Decision }) {
  const apply = useApply();
  const ref = { list: "decisions" as const, id: decision.id };
  return (
    <ItemShell
      itemRef={ref}
      flags={decision.flags}
      anchors={decision.anchors}
      menu={<MoveMenu from="decisions" id={decision.id} />}
      removeLabel="결정 지우기"
    >
      <StatementText
        value={decision.text}
        placeholder="법원이 최종으로 결정한 내용(주문)"
        onChange={(text) =>
          apply((structure) => updateItem(structure, ref, { text }))
        }
      />
    </ItemShell>
  );
}
