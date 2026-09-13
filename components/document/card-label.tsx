import { HugeiconsIcon } from "@hugeicons/react";
import {
  BubbleChatIcon,
  GavelIcon,
  JusticeScale01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import type { CardRole } from "@/lib/domain/document";
import { withParticle } from "@/lib/domain/korean";
import { cn } from "@/lib/utils";

/**
 * The speaker of a card, spelled out with an icon so readers can tell a
 * party's words from the court's without relying on color.
 */
export function cardLabelText(role: CardRole, partyName: string | null) {
  switch (role) {
    case "person":
      return partyName ?? "등장인물";
    case "claim":
      return `${withParticle(partyName ?? "당사자", "이/가")} 한 말`;
    case "finding":
      return "법원의 생각";
    case "decision":
      return "법원이 정한 것";
    case "background":
      return null;
  }
}

const ICONS = {
  person: UserIcon,
  claim: BubbleChatIcon,
  finding: JusticeScale01Icon,
  decision: GavelIcon,
} as const;

export function CardLabel({
  role,
  partyName,
  className,
}: {
  role: CardRole;
  partyName: string | null;
  className?: string;
}) {
  const text = cardLabelText(role, partyName);
  if (role === "background" || !text) return null;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8em] leading-none font-bold",
        role === "claim" && "bg-info/12 text-info",
        (role === "finding" || role === "decision") &&
          "bg-primary/20 text-primary-text",
        role === "person" && "bg-secondary text-foreground",
        className,
      )}
    >
      <HugeiconsIcon
        icon={ICONS[role]}
        strokeWidth={2.2}
        className="size-[1.15em]"
        aria-hidden="true"
      />
      {text}
    </span>
  );
}
