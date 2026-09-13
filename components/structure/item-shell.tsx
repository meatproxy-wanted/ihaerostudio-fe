"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Cancel01Icon,
  Delete02Icon,
  Link04Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { AiFlag, Anchor } from "@/lib/domain/common";
import {
  dismissFlags,
  removeAnchor,
  removeItem,
  type ItemRef,
} from "@/lib/domain/structure-ops";
import { cn } from "@/lib/utils";

import { useAnchorQuote } from "@/components/source-viewer/source-text";
import { useStructure, useStructureStore } from "./structure-store";

export function itemElementId(id: string) {
  return `structure-item-${id}`;
}

/**
 * Frame shared by every structure item: selection (which drives the source
 * highlight), AI flags, anchors, and deletion with undo.
 */
export function ItemShell({
  itemRef,
  flags,
  anchors,
  children,
  menu,
  removeLabel = "지우기",
  className,
}: {
  itemRef: ItemRef;
  flags: AiFlag[];
  anchors: Anchor[];
  children: ReactNode;
  menu?: ReactNode;
  removeLabel?: string;
  className?: string;
}) {
  const store = useStructureStore();
  const selected = useStructure(
    (state) =>
      state.selected?.id === itemRef.id && state.selected.list === itemRef.list,
  );
  const quote = useAnchorQuote();

  function select() {
    if (!selected) store.getState().select(itemRef);
  }

  function remove() {
    const before = store.getState().value;
    store.getState().apply((structure) => removeItem(structure, itemRef));
    store.getState().select(null);
    toast.add({
      title: "항목을 지웠어요",
      actionProps: {
        children: "되돌리기",
        onClick: () => store.getState().apply(() => before),
      },
    });
  }

  return (
    <article
      id={itemElementId(itemRef.id)}
      data-selected={selected || undefined}
      onFocusCapture={select}
      onClick={select}
      className={cn(
        "scroll-mt-32 rounded-xl bg-card p-3 ring-1 ring-hairline transition-shadow",
        flags.length > 0 && "ring-warning/50",
        selected && "ring-2 ring-primary",
        className,
      )}
    >
      {flags.map((flag) => (
        <div
          key={flag.code}
          className="mb-2.5 flex items-start gap-2 rounded-lg bg-warning/10 px-2.5 py-2 text-2sm text-warning"
        >
          <HugeiconsIcon
            icon={Alert02Icon}
            strokeWidth={2}
            size={16}
            className="mt-0.5 shrink-0"
          />
          <span className="flex-1">
            <span className="font-semibold">확인 필요 · </span>
            {flag.message}
          </span>
          <Button
            variant="ghost"
            size="xs"
            className="shrink-0 text-warning"
            onClick={(event) => {
              event.stopPropagation();
              store
                .getState()
                .apply((structure) => dismissFlags(structure, itemRef));
            }}
          >
            확인했어요
          </Button>
        </div>
      ))}

      {children}

      <div className="mt-2.5 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-2sm",
            anchors.length === 0 ? "text-warning" : "text-muted-foreground",
          )}
        >
          <HugeiconsIcon icon={Link04Icon} strokeWidth={2} size={14} />
          {anchors.length === 0 ? "원문 근거 없음" : `근거 ${anchors.length}`}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {menu}
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={removeLabel}
            className="text-muted-foreground hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              remove();
            }}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </Button>
        </div>
      </div>

      {selected && (
        <div className="mt-2.5 flex flex-col gap-1.5 border-t border-hairline pt-2.5">
          {anchors.map((anchor) => (
            <div
              key={`${anchor.paragraphId}:${anchor.start}:${anchor.end}`}
              className="flex items-start gap-2 rounded-lg bg-primary/10 px-2.5 py-1.5 text-2sm"
            >
              <span className="line-clamp-2 flex-1 text-foreground/85">
                “{quote(anchor)}”
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="이 근거 빼기"
                className="text-muted-foreground"
                onClick={() =>
                  store
                    .getState()
                    .apply((structure) =>
                      removeAnchor(structure, itemRef, anchor),
                    )
                }
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </Button>
            </div>
          ))}
          <p className="text-2sm text-muted-foreground">
            원문에서 글자를 드래그하면 근거를 더할 수 있어요.
          </p>
        </div>
      )}
    </article>
  );
}
