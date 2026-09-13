"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import { LongJobLoader, useLongJob } from "@/components/app/long-job";
import { DRAFT_STEPS } from "@/components/structure/draft-steps";
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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { cacheProject } from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import { countTouchedSentences } from "@/lib/domain/document-ops";
import type { Project } from "@/lib/domain/project";
import { isDraftOutdated } from "@/lib/domain/steps";
import { routes } from "@/lib/routes";

import { useEditorStore } from "./editor-store";

/**
 * Shown when the case structure or settings changed after the draft was
 * made. The draft never updates by itself; regenerating is the producer's
 * call and discards their work, so it is confirmed with a count.
 */
export function OutdatedDraftBanner({
  project,
  flush,
  onRegenerated,
}: {
  project: Project;
  flush: () => Promise<void>;
  onRegenerated: () => void;
}) {
  const store = useEditorStore();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [touched, setTouched] = useState(0);

  const regenerate = useLongJob({
    run: async (_input: void, signal) => {
      await flush();
      if (store.getState().saveStatus === "error") {
        throw new ApiError(
          "failed",
          "편집 내용을 저장하지 못해서 초안을 다시 만들 수 없어요.",
        );
      }
      return api.document.generate(project.id, { signal });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.document(project.id), result.document);
      cacheProject(queryClient, result.project);
      queryClient.removeQueries({ queryKey: queryKeys.review(project.id) });
      toast.add({ title: "초안을 다시 만들었어요", type: "success" });
      onRegenerated();
    },
  });

  if (!isDraftOutdated(project)) return null;

  return (
    <>
      <div
        role="status"
        className="flex items-center gap-3 border-b border-warning/30 bg-warning/10 px-4 py-2.5 text-2sm"
      >
        <HugeiconsIcon
          icon={Alert02Icon}
          strokeWidth={2}
          size={18}
          className="shrink-0 text-warning"
        />
        <p className="flex-1">
          <span className="font-semibold">사건 구조가 바뀌었어요.</span> 초안을
          만든 뒤 사건 구조나 자료 설정이 바뀌었어요. 반영하려면 초안을 다시
          만들어야 해요.
          {regenerate.error !== null && (
            <span className="ml-1 text-destructive">
              {errorMessage(regenerate.error)}
            </span>
          )}
        </p>
        <Button
          size="xs"
          variant="ghost"
          nativeButton={false}
          render={<Link href={routes.step(project.id, "structure")} />}
        >
          사건 구조 보기
        </Button>
        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            setTouched(countTouchedSentences(store.getState().value));
            setConfirming(true);
          }}
        >
          초안 다시 만들기
        </Button>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{"초안을\n다시 만들까요?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {touched > 0
                ? `지금까지 손본 문장 ${touched}개가 사라지고 새 초안으로 바뀌어요. 되돌릴 수 없어요.`
                : "지금 초안이 새 초안으로 바뀌어요."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              onClick={() => {
                setConfirming(false);
                void regenerate.start();
              }}
            >
              다시 만들기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LongJobLoader
        job={regenerate}
        title="초안을 다시 만들고 있어요"
        steps={DRAFT_STEPS}
      />
    </>
  );
}
