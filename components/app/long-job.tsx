"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  MultiStepLoader,
  useTimedStep,
  type LoaderStep,
} from "@/components/app/multi-step-loader";
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

export function LongJobLoader({
  job,
  title,
  steps,
}: {
  job: { phase: Phase; runId: number; cancel: () => void };
  title: string;
  steps: LoaderStep[];
}) {
  if (job.phase === "idle") {
    return (
      <MultiStepLoader open={false} title={title} steps={steps} value={0} />
    );
  }
  return (
    <TimedLoader
      key={job.runId}
      title={title}
      steps={steps}
      completed={job.phase === "done"}
      onCancel={job.cancel}
    />
  );
}

function TimedLoader({
  title,
  steps,
  completed,
  onCancel,
}: {
  title: string;
  steps: LoaderStep[];
  completed: boolean;
  onCancel: () => void;
}) {
  const step = useTimedStep(steps.length);
  return (
    <MultiStepLoader
      open
      title={title}
      steps={steps}
      value={step}
      completed={completed}
      onCancel={onCancel}
    />
  );
}
