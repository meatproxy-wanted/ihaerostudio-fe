"use client";

/*
 * Adapted from Aceternity UI's Multi Step Loader
 * (https://ui.aceternity.com/components/multi-step-loader):
 * - the current step is controlled by the caller (no timer inside), so it can
 *   follow a real job or a timed estimate and pass the hooks lint rules
 * - project tokens instead of hard-coded white/black/lime colors
 * - hugeicons instead of inline heroicons, no @tabler/icons-react
 * - announces the current step, honors reduced motion, offers cancel
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, CircleIcon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface LoaderStep {
  text: string;
}

const ROW_HEIGHT = 44;

function LoaderCore({
  steps,
  value,
  completed,
}: {
  steps: LoaderStep[];
  value: number;
  completed: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto mt-32 flex max-w-xl flex-col justify-start">
      {steps.map((step, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.22, 0.12);
        const done = completed || index < value;
        const current = !completed && index === value;

        return (
          <motion.div
            key={step.text}
            className="flex items-center gap-2.5"
            style={{ height: ROW_HEIGHT }}
            initial={{ opacity: 0, y: -(value * ROW_HEIGHT) }}
            animate={{ opacity, y: -(value * ROW_HEIGHT) }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
          >
            <HugeiconsIcon
              icon={done || current ? CheckmarkCircle02Icon : CircleIcon}
              strokeWidth={2}
              size={22}
              className={cn(
                "shrink-0",
                done && "text-success",
                current && "animate-pulse text-primary-text",
                !done && !current && "text-muted-foreground",
              )}
            />
            <span
              className={cn(
                "text-md font-semibold text-muted-foreground",
                done && "text-foreground",
                current && "text-primary-text",
              )}
            >
              {step.text}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Full-screen progress for long AI jobs. `value` is the step in progress;
 * `completed` checks every step once the job has finished.
 */
export function MultiStepLoader({
  open,
  title,
  steps,
  value,
  completed = false,
  onCancel,
}: {
  open: boolean;
  title: string;
  steps: LoaderStep[];
  value: number;
  completed?: boolean;
  onCancel?: () => void;
}) {
  const current = completed
    ? "모두 끝났어요."
    : (steps[Math.min(value, steps.length - 1)]?.text ?? "");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-2xl"
        >
          <div className="relative h-80 w-full max-w-md px-6">
            <LoaderCore
              steps={steps}
              value={Math.min(value, steps.length - 1)}
              completed={completed}
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-full bg-background [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]"
          />
          <div className="relative z-30 mt-4 flex flex-col items-center gap-4 px-6 text-center">
            <p className="text-lg font-bold tracking-tight">{title}</p>
            <p role="status" aria-live="polite" className="sr-only">
              {current}
            </p>
            {onCancel && !completed && (
              <Button variant="secondary" onClick={onCancel} autoFocus>
                취소
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Walks through `stepCount` steps on a timer and waits on the last one. Mount
 * it per run (e.g. with a `key`) so every run starts from the first step.
 */
export function useTimedStep(stepCount: number, intervalMs = 1500) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((previous) => Math.min(previous + 1, stepCount - 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [stepCount, intervalMs]);

  return step;
}
