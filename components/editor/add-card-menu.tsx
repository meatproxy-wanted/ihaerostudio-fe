"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CARD_ROLE_LABELS,
  SECTION_CARD_ROLES,
  type CardRole,
  type SectionKind,
} from "@/lib/domain/document";
import { addCard } from "@/lib/domain/document-ops";
import { withParticle } from "@/lib/domain/korean";

import { useEditor, useEditorStore } from "./editor-store";

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

/** Adds a card whose role fits the section, then starts writing in it. */
export function AddCardMenu({ section }: { section: SectionKind }) {
  const store = useEditorStore();
  const parties = useEditor((state) => state.value.partyNames);
  const roles = SECTION_CARD_ROLES[section];
  if (roles.length === 0) return null;

  interface Option {
    key: string;
    label: string;
    role: CardRole;
    partyId?: string;
  }
  const options = roles.flatMap((role): Option[] =>
    role === "person" || role === "claim"
      ? parties.map((party) => ({
          key: `${role}:${party.partyId}`,
          label:
            role === "person"
              ? `${party.displayName} 소개`
              : `${withParticle(party.displayName, "이/가")} 한 말`,
          role,
          partyId: party.partyId,
        }))
      : [{ key: role, label: CARD_ROLE_LABELS[role], role }],
  );

  function add(option: Option) {
    const sentenceId = newId("s");
    store.getState().apply((document) =>
      addCard(document, {
        section,
        cardId: newId("card"),
        sentenceId,
        role: option.role,
        partyId: option.partyId,
      }),
    );
    store.getState().startEditing(sentenceId);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-12 w-full rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:text-foreground"
          />
        }
      >
        <HugeiconsIcon
          icon={Add01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        카드 추가
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>어떤 카드인가요?</DropdownMenuLabel>
          {options.map((option) => (
            <DropdownMenuItem key={option.key} onClick={() => add(option)}>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
