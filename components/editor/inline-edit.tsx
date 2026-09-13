"use client";

import { useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

function useDraft(value: string, onCommit: (value: string) => void) {
  const [draft, setDraft] = useState<string | null>(null);
  return {
    draft,
    start: () => setDraft(value),
    change: setDraft,
    cancel: () => setDraft(null),
    commit: () => {
      if (draft !== null && draft !== value) onCommit(draft);
      setDraft(null);
    },
  };
}

/** A line of text that turns into an input when clicked (titles). */
export function InlineText({
  value,
  onCommit,
  label,
  className,
  inputClassName,
}: {
  value: string;
  onCommit: (value: string) => void;
  label: string;
  className?: string;
  inputClassName?: string;
}) {
  const { draft, start, change, cancel, commit } = useDraft(value, onCommit);

  if (draft !== null) {
    return (
      <input
        autoFocus
        aria-label={label}
        value={draft}
        onChange={(event) => change(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") cancel();
        }}
        className={cn(
          "w-full rounded-lg bg-background px-2 ring-2 ring-primary outline-none",
          inputClassName,
        )}
      />
    );
  }
  return (
    <button
      type="button"
      onClick={start}
      title={`${label} 고치기`}
      className={cn(
        "-mx-2 rounded-lg px-2 text-left hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
        className,
      )}
    >
      {value || <span className="text-muted-foreground">({label})</span>}
    </button>
  );
}

/**
 * In-place sentence rewrite: Enter or leaving the field applies, Escape
 * cancels. Sentences stay on one line, so newlines are never inserted.
 */
export function SentenceEditor({
  value,
  onCommit,
  onCancel,
}: {
  value: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    event.stopPropagation();
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onCommit(draft.trim());
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <textarea
      autoFocus
      aria-label="문장 직접 수정"
      value={draft}
      rows={1}
      onFocus={(event) =>
        event.currentTarget.setSelectionRange(draft.length, draft.length)
      }
      onChange={(event) => setDraft(event.target.value.replace(/\n/g, " "))}
      onKeyDown={handleKeyDown}
      onBlur={() => onCommit(draft.trim())}
      className="-mx-2 field-sizing-content w-[calc(100%+1rem)] resize-none rounded-lg bg-background px-2 py-1 leading-relaxed [word-break:keep-all] ring-2 ring-primary outline-none"
    />
  );
}
