"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ErrorState } from "@/components/app/error-state";
import { fromImageProgress } from "@/components/app/generation-stage";
import GenerationLoading from "@/components/ui/GenerationLoading";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { cacheProject } from "@/lib/api/hooks";
import { prepareEditorImages } from "@/lib/api/image-preparation";
import { queryKeys } from "@/lib/api/query-keys";
import type { ImagePreparationResult } from "@/lib/api/types";
import type { EasyDocument } from "@/lib/domain/document";

export function ImagePreparation({
  projectId,
  children,
}: {
  projectId: string;
  children: (document: EasyDocument) => ReactNode;
}) {
  const queryClient = useQueryClient();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<ImagePreparationResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [partial, setPartial] = useState<EasyDocument | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void prepareEditorImages(
      () =>
        api.document.prepareImages(projectId, { signal: controller.signal }),
      controller.signal,
      setResult,
    )
      .then((ready) => {
        if (controller.signal.aborted) return;
        queryClient.setQueryData(queryKeys.document(projectId), ready.document);
        cacheProject(queryClient, ready.project);
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) setError(caught);
      });
    return () => controller.abort();
  }, [projectId, queryClient, attempt]);

  if (partial)
    return (
      <div className="flex h-full flex-col">
        <p
          role="alert"
          className="border-b border-hairline bg-secondary px-4 py-3 text-sm"
        >
          그림 생성이 일부 완료되지 않았어요. 완성된 글과 그림은 유지되며,
          자료와 그림을 확인한 뒤 검토해 주세요.
        </p>
        <div className="min-h-0 flex-1">{children(partial)}</div>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <ErrorState
          title="그림 자동 생성을 마치지 못했어요"
          error={error}
          onRetry={() => {
            setError(null);
            setAttempt((value) => value + 1);
          }}
        />
        <Button
          variant="secondary"
          disabled={opening}
          onClick={async () => {
            setOpening(true);
            try {
              const [document, project] = await Promise.all([
                api.document.get(projectId),
                api.projects.get(projectId),
              ]);
              queryClient.setQueryData(queryKeys.document(projectId), document);
              cacheProject(queryClient, project);
              setPartial(document);
            } catch (caught) {
              setError(caught);
            } finally {
              setOpening(false);
            }
          }}
        >
          생성된 자료로 편집 계속하기
        </Button>
      </div>
    );
  if (result && result.generation.status !== "running")
    return children(result.document);
  /*
    The only pass with a real count: the server reports completed/total as
    it draws, so this screen shows the true number rather than a timer's
    guess. The phase tells us which half it is in — reference portraits
    first, then the scenes that follow them.
  */
  const progress = result?.generation;
  const { stage, count } = fromImageProgress(progress);
  return (
    <GenerationLoading
      stage={stage}
      count={count}
      progress={
        progress?.total
          ? (progress.completed / progress.total) * 100
          : undefined
      }
      hint={
        progress?.phase === "scenes"
          ? "고정된 등장인물을 참고해 장면 그림을 만들고 있어요. 나가면 멈추지만, 완성된 그림은 남습니다."
          : "먼저 등장인물의 기준 그림을 만들고 있어요. 나가면 멈추지만, 완성된 그림은 남습니다."
      }
    />
  );
}
