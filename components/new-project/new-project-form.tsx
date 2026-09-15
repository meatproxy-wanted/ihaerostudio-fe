"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, SparklesIcon } from "@hugeicons/core-free-icons";

import { LongJobLoader, useLongJob } from "@/components/app/long-job";
import { ServerModeNotice } from "@/components/app/server-mode-notice";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cacheProject } from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import type { CreateProjectInput } from "@/lib/api/types";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/domain/common";
import { routes } from "@/lib/routes";
import { SAMPLE_JUDGMENT_TEXT } from "@/lib/sample-judgment";

import { ANALYSIS_STEPS } from "./analysis-steps";
import { SettingsPicker } from "./settings-picker";
import { SourceInput, sourceProblem, type SourceDraft } from "./source-input";

const SAMPLE_SOURCE: SourceDraft = {
  tab: "text",
  file: null,
  text: SAMPLE_JUDGMENT_TEXT,
};

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

  const [source, setSource] = useState<SourceDraft>(() =>
    wantsSample ? SAMPLE_SOURCE : { tab: "pdf", file: null, text: "" },
  );
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

  /** Fills in the sample judgment and sends it to the server like any text. */
  function startWithSample() {
    setSource(SAMPLE_SOURCE);
    void analysis.start({ source: toSourceInput(SAMPLE_SOURCE), settings });
  }

  return (
    <>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-10 pb-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-2sm font-semibold text-primary-text">
              1단계 · 판결문 올리기
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              새 자료 만들기
            </h1>
            <p className="text-md text-muted-foreground">
              판결문을 넣고 결과물의 말투와 모양을 고르면, AI가 사건 구조를
              정리해요.
            </p>
          </div>
          <Button variant="secondary" onClick={startWithSample}>
            <HugeiconsIcon
              icon={SparklesIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            샘플 판결문으로 체험하기
          </Button>
        </div>

        <ServerModeNotice className="mt-6" />

        <section className="mt-10">
          <SectionHeading
            number={1}
            title="판결문"
            description="PDF를 올리거나 텍스트를 붙여 넣어요."
          />
          <SourceInput
            value={source}
            onChange={setSource}
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
          <Button size="lg" onClick={start} className="sm:min-w-44">
            <HugeiconsIcon
              icon={AiMagicIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {analysis.error ? "다시 분석하기" : "AI 분석 시작하기"}
          </Button>
        </div>
      </div>

      <LongJobLoader
        job={analysis}
        title="판결문을 분석하고 있어요"
        steps={ANALYSIS_STEPS}
        stepMs={6_000}
      />
    </>
  );
}
