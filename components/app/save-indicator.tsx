"use client";

import { useEffect, useEffectEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, CloudSavingDone01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
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

/**
 * Raises a lasting toast with [다시 시도] while a save has failed, and takes
 * it down once saving starts again (a retry or a new edit).
 */
export function useSaveFailureToast(status: SaveStatus, onRetry: () => void) {
  const retry = useEffectEvent(onRetry);
  useEffect(() => {
    if (status !== "error") return;
    const id = toast.add({
      title: "저장하지 못했어요",
      description: "고친 내용은 화면에 남아 있어요. 다시 시도해 주세요.",
      type: "error",
      timeout: 0,
      actionProps: {
        children: "다시 시도",
        onClick: () => retry(),
      },
    });
    return () => toast.close(id);
  }, [status]);
}
