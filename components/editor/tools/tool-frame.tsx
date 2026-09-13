"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api/errors";

import { useEditorStore } from "../editor-store";

export function ToolFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const store = useEditorStore();
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-3 bg-primary/5 px-4 py-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`${title} 닫기`}
          onClick={() => store.getState().openTool(null)}
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        </Button>
      </div>
      {children}
    </section>
  );
}

export function ToolLoading({ label }: { label: string }) {
  return (
    <div aria-live="polite" className="flex flex-col gap-2">
      <p className="text-2sm text-muted-foreground">{label}</p>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}

export function ToolError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-start gap-2 text-2sm">
      <p className="text-destructive">{errorMessage(error)}</p>
      <Button size="xs" variant="secondary" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}
