"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import GenerateButton from "@/components/ui/GenerateButton";
import { getDraftReadiness } from "@/lib/domain/structure-ops";

import { itemElementId } from "./item-shell";
import { useStructure, useStructureStore } from "./structure-store";
import { regenerateWarning } from "./use-generate-draft";

type Confirmation = "flags" | "regenerate" | null;

/**
 * The last thing in the list: a checkpoint you reach by reading everything
 * above it. It stays a card, and stays in the scroll, because ticking it is
 * a statement about what you just read — the bar below only reports and
 * acts on it.
 */
export function DraftConfirmCard({
  confirmed,
  onConfirmedChange,
}: {
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-card p-5 ring-1 ring-border">
      <Checkbox
        checked={confirmed}
        onCheckedChange={(checked) => onConfirmedChange(checked === true)}
        className="mt-0.5"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-md font-bold">원문과 비교해 확인했어요</span>
        <span className="text-2sm text-muted-foreground">
          특히 당사자의 주장과 법원의 판단·결정이 섞이지 않았는지 봐 주세요.
        </span>
      </span>
    </label>
  );
}

export function DraftFooter({
  hasDraft,
  confirmed,
  touchedSentences,
  busy,
  onGenerate,
}: {
  hasDraft: boolean;
  /** Ticked on the confirm card at the foot of the list. */
  confirmed: boolean;
  /** Worked-on sentences a regeneration would discard, when known. */
  touchedSentences: number | null;
  busy: boolean;
  onGenerate: () => void;
}) {
  const store = useStructureStore();
  const structure = useStructure((state) => state.value);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const { blockers, flagCount } = getDraftReadiness(structure, confirmed);
  const itemBlockers = blockers.filter(
    (blocker) => blocker.code !== "not-confirmed",
  );
  const ready = blockers.length === 0;

  function request() {
    if (!ready) return;
    if (flagCount > 0) setConfirmation("flags");
    else if (hasDraft) setConfirmation("regenerate");
    else onGenerate();
  }

  function afterFlags() {
    if (hasDraft) setConfirmation("regenerate");
    else {
      setConfirmation(null);
      onGenerate();
    }
  }

  return (
    /*
      The end of the list, under the card that unlocks it: what is blocking,
      then the action. Nothing pinned and no card around it — this is the
      last thing you reach by reading, not a layer over what you are
      reading, and the heading it used to carry said what the button says.
    */
    <section className="flex flex-col gap-2.5">
      {itemBlockers.length > 0 && (
        <ul className="flex flex-col gap-1">
          {itemBlockers.map((blocker, index) => (
            <li key={`${blocker.code}-${blocker.item?.id ?? index}`}>
              <button
                type="button"
                disabled={!blocker.item}
                onClick={() => {
                  if (!blocker.item) return;
                  store.getState().select(blocker.item);
                  document
                    .getElementById(itemElementId(blocker.item.id))
                    ?.scrollIntoView({ block: "center" });
                }}
                className="flex items-center gap-2 text-left text-2sm text-destructive enabled:hover:underline"
              >
                <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} size={14} />
                {blocker.message}
                {blocker.item && " 보러 가기"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Same row as the one under the new-material form: the state on the
          left, the action on the right, stacking on a narrow column. Only
          the pinning differs, because only that form scrolls under it. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-2sm text-muted-foreground">
          {!confirmed
            ? "위 확인란에 체크하면 만들 수 있어요."
            : flagCount > 0
              ? `아직 확인 필요 표시가 ${flagCount}개 있어요.`
              : "AI 확인 필요 표시를 모두 확인했어요."}
        </p>
        <GenerateButton
          hug
          size="sm"
          disabled={!ready}
          loading={busy}
          onClick={request}
        >
          {hasDraft ? "초안 다시 만들기" : "초안 만들기"}
        </GenerateButton>
      </div>

      <AlertDialog
        open={confirmation !== null}
        onOpenChange={(open) => !open && setConfirmation(null)}
      >
        <AlertDialogContent size="sm">
          {confirmation === "flags" ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {`확인 필요 ${flagCount}개가\n남았어요`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  AI가 확인해 달라고 표시한 항목이 있어요. 그래도 초안을
                  만들까요?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>더 볼게요</AlertDialogCancel>
                <AlertDialogAction onClick={afterFlags}>
                  그래도 만들기
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{"초안을\n다시 만들까요?"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {regenerateWarning(touchedSentences)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  variant="danger"
                  onClick={() => {
                    setConfirmation(null);
                    onGenerate();
                  }}
                >
                  다시 만들기
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
