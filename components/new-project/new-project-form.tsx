"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { LongJobLoader, useLongJob } from "@/components/app/long-job";
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
import GenerateButton from "@/components/ui/GenerateButton";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cacheProject } from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import type { CreateProjectInput } from "@/lib/api/types";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/domain/common";
import { routes } from "@/lib/routes";

import { ANALYSIS_STEPS } from "./analysis-steps";
import { SettingsPicker } from "./settings-picker";
import {
  isSampleSource,
  SAMPLE_SOURCE,
  SourceInput,
  sourceProblem,
  type SourceDraft,
} from "./source-input";

const EMPTY_SOURCE: SourceDraft = { tab: "pdf", file: null, text: "" };

function toSourceInput(source: SourceDraft): CreateProjectInput["source"] {
  return source.tab === "pdf" && source.file
    ? { kind: "pdf", file: source.file }
    : { kind: "text", text: source.text };
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-2sm font-bold text-background"
      >
        {number}
      </span>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="text-2sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function NewProjectForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const wantsSample = useSearchParams().get("sample") === "1";

  /*
    `?sample=1` is a request, not a seed. The panel's sample link points at
    this same screen, and pressing it from here only changes the query —
    React keeps the form mounted, so a value read once at mount would never
    be read again. The request is answered on every render instead: while
    the box is empty it holds the sample, and a draft with anything in it
    wins. Once the producer takes the box over, `clearSampleRequest` drops
    the query, so emptying the sample out does not snap it back.
  */
  const [draft, setDraft] = useState<SourceDraft | null>(null);
  const hasContent =
    draft !== null && (draft.file !== null || draft.text.trim() !== "");
  const source =
    wantsSample && !hasContent ? SAMPLE_SOURCE : (draft ?? EMPTY_SOURCE);

  /*
    Asked, with work already in the box — the one case worth interrupting.
    Answering closes the dialog by making this false, rather than by waiting
    for the replaced URL to come back around.
  */
  const askOverwrite =
    wantsSample && hasContent && draft !== null && !isSampleSource(draft);

  function clearSampleRequest() {
    if (wantsSample) router.replace(routes.newProject(), { scroll: false });
  }

  function editDraft(next: SourceDraft) {
    setDraft(next);
    clearSampleRequest();
  }

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [attempted, setAttempted] = useState(false);

  const analysis = useLongJob({
    run: (input: CreateProjectInput, signal) =>
      api.projects.create(input, { signal }),
    onSuccess: (project) => {
      cacheProject(queryClient, project);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      router.push(routes.step(project.id, "structure"));
    },
  });

  const problem = sourceProblem(source);

  function start() {
    setAttempted(true);
    if (problem) return;
    void analysis.start({ source: toSourceInput(source), settings });
  }

  return (
    <>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-10 pb-12 sm:px-6">
        <div className="flex flex-col gap-1">
          <p className="text-2sm font-semibold text-primary-text">
            1단계 · 판결문 올리기
          </p>
          <h1 className="text-2xl font-bold tracking-tight">새 자료 만들기</h1>
          <p className="text-md text-muted-foreground">
            판결문을 넣고 결과물의 말투와 모양을 고르면, AI가 사건 구조를
            정리해요.
          </p>
        </div>

        <section className="mt-10">
          <SectionHeading
            number={1}
            title="판결문"
            description="PDF를 올리거나 텍스트를 붙여 넣어요."
          />
          <SourceInput
            value={source}
            onChange={editDraft}
            showErrors={attempted}
          />
        </section>

        <section className="mt-12">
          <SectionHeading
            number={2}
            title="결과물 설정"
            description="고른 설정으로 초안을 만들어요. 사건 구조 단계에서 다시 바꿀 수 있어요."
          />
          <SettingsPicker value={settings} onChange={setSettings} />
        </section>
      </main>

      <div className="sticky bottom-0 z-10 border-t border-hairline bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {analysis.error ? (
            <p role="alert" className="text-2sm font-medium text-destructive">
              {errorMessage(analysis.error)}
            </p>
          ) : (
            <p className="text-2sm text-muted-foreground">
              {problem ?? "준비됐어요. 분석에는 1분 정도 걸릴 수 있어요."}
            </p>
          )}
          <GenerateButton
            hug
            loading={analysis.phase === "running"}
            onClick={start}
          >
            {analysis.error ? "다시 분석하기" : "AI 분석 시작하기"}
          </GenerateButton>
        </div>
      </div>

      <AlertDialog
        open={askOverwrite}
        onOpenChange={(open) => {
          if (!open) clearSampleRequest();
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{"샘플 판결문으로\n바꿀까요?"}</AlertDialogTitle>
            <AlertDialogDescription>
              지금 넣어 둔 판결문은 사라져요. 결과물 설정은 그대로예요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>그대로 두기</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDraft(SAMPLE_SOURCE)}>
              샘플로 바꾸기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LongJobLoader
        job={analysis}
        title="판결문을 분석하고 있어요"
        steps={ANALYSIS_STEPS}
        stepMs={6_000}
      />
    </>
  );
}
