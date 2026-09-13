"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, CloudSavingDone01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { SaveStatus } from "@/lib/stores/autosave";

/** "저장 중… / 저장됨 / 저장 못 함" for editors that autosave. */
export function SaveIndicator({
  status,
  dirty,
  onRetry,
}: {
  status: SaveStatus;
  dirty: boolean;
  onRetry: () => void;
}) {
  if (status === "error") {
    return (
      <span
        role="alert"
        className="flex items-center gap-1.5 text-2sm text-destructive"
      >
        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} size={16} />
        저장 못 함
        <Button variant="destructive" size="xs" onClick={onRetry}>
          다시 시도
        </Button>
      </span>
    );
  }
  const saving = status === "saving" || dirty;
  return (
    <span
      aria-live="polite"
      className="flex items-center gap-1.5 text-2sm whitespace-nowrap text-muted-foreground"
    >
      {saving ? (
        <Spinner className="size-3.5" />
      ) : (
        <HugeiconsIcon icon={CloudSavingDone01Icon} strokeWidth={2} size={16} />
      )}
      {saving ? "저장 중…" : "저장됨"}
    </span>
  );
}
