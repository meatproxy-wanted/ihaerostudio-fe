"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import GenerationLoading, {
  type GenerationStage,
} from "@/components/ui/GenerationLoading";
import { Button } from "@/components/ui/button";
import { isAbortError } from "@/lib/api/errors";

type Phase = "idle" | "running" | "done";

/** How long the fully checked loader stays up before moving on. */
const DONE_PAUSE_MS = 500;

/**
 * Runs a long, cancellable AI request behind the multi-step loader. Aborts
 * return to idle quietly; other failures are kept in `error` for the screen.
 */
export function useLongJob<Input, Result>(options: {
  run: (input: Input, signal: AbortSignal) => Promise<Result>;
  onSuccess: (result: Result) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [runId, setRunId] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => () => controllerRef.current?.abort(), []);

  const start = useCallback(async (input: Input) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setError(null);
    setPhase("running");
    setRunId((id) => id + 1);

    try {
      const result = await optionsRef.current.run(input, controller.signal);
      if (controller.signal.aborted) return;
      setPhase("done");
      await new Promise((resolve) => setTimeout(resolve, DONE_PAUSE_MS));
      optionsRef.current.onSuccess(result);
    } catch (caught) {
      setPhase("idle");
      if (!isAbortError(caught)) setError(caught);
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setPhase("idle");
  }, []);

  return { phase, runId, error, start, cancel };
}

/**
 * The generation screen, over everything, for as long as the job runs.
 *
 * The stages are walked on a timer because these two calls are a single
 * await with no progress channel — see `generation-stage.ts`. No percentage
 * is passed: the screen reads the stage and fills its own bar to that
 * stage's mark. It always lists the whole pipeline, so a call covering only
 * the first two stages leaves the later ones pending and the bar short of
 * full. That is the truth — the material is not finished until the
 * pictures are.
 */
export function LongJobLoader({
  job,
  stages,
  stageMs = 6_000,
  documentLabel,
}: {
  job: { phase: Phase; runId: number; cancel: () => void };
  stages: GenerationStage[];
  /** How long each stage holds before the next; the last waits for the job. */
  stageMs?: number;
  documentLabel?: string;
}) {
  if (job.phase === "idle") return null;
  return (
    <GenerationOverlay
      key={job.runId}
      stages={stages}
      stageMs={stageMs}
      completed={job.phase === "done"}
      documentLabel={documentLabel}
      onCancel={job.cancel}
    />
  );
}

function GenerationOverlay({
  stages,
  stageMs,
  completed,
  documentLabel,
  onCancel,
}: {
  stages: GenerationStage[];
  stageMs: number;
  completed: boolean;
  documentLabel?: string;
  onCancel: () => void;
}) {
  const index = useTimedStep(stages.length, stageMs);
  const stage = completed ? "done" : (stages[index] ?? stages[0]);

  return (
    <div className="fixed inset-0 z-50">
      <GenerationLoading
        stage={stage}
        documentLabel={documentLabel}
        className="h-full"
      />
      <Button
        variant="secondary"
        onClick={onCancel}
        className="absolute top-4 right-4"
      >
        그만두기
      </Button>
    </div>
  );
}

/** Advances one step every `intervalMs`, stopping on the last. */
function useTimedStep(stepCount: number, intervalMs: number) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((previous) => Math.min(previous + 1, stepCount - 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [stepCount, intervalMs]);

  return step;
}
