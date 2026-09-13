"use client";

import { useSyncExternalStore } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NARROW = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

const triggerClassName =
  "cursor-pointer rounded-[0.2em] font-semibold underline decoration-foreground/50 decoration-dotted decoration-2 underline-offset-[0.28em] hover:bg-info/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * A glossary word readers can tap: a popover on wide screens, a sheet from
 * the bottom on phones. Portaled content keeps the light paper look.
 */
export function ReaderTerm({
  term,
  explanation,
  surface,
}: {
  term: string;
  explanation: string;
  surface: string;
}) {
  const narrow = useNarrow();
  const trigger = (
    <button type="button" className={triggerClassName}>
      {surface}
      <span className="sr-only"> (뜻 보기)</span>
    </button>
  );

  if (narrow) {
    return (
      <Sheet>
        <SheetTrigger render={trigger} />
        <SheetContent
          side="bottom"
          className="paper gap-3 rounded-t-3xl px-6 pt-7 pb-10 text-[20px]"
        >
          <SheetTitle className="text-[1.2em] font-bold">{term}</SheetTitle>
          <SheetDescription className="text-[1em] leading-[1.7] text-foreground">
            {explanation}
          </SheetDescription>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Popover>
      <PopoverTrigger render={trigger} />
      <PopoverContent className="paper w-80 gap-2 p-5 text-[18px]">
        <p className="text-[1.1em] font-bold">{term}</p>
        <p className="leading-[1.7]">{explanation}</p>
      </PopoverContent>
    </Popover>
  );
}
