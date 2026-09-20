"use client";

import * as React from "react";
import "./stepper.css";

export type Step = {
  /** 라우트나 상태 키 */
  id: string;
  label: string;
  /**
   * 이 항목을 감쌀 래퍼. 단계가 이동이 아니라 무언가를 여는 경우
   * (팝오버 트리거 등) 쓴다. 바는 모양만 알고, 무엇이 열리는지는 모른다.
   */
  wrap?: (item: React.ReactNode) => React.ReactNode;
  /** 아직 열 수 없는 단계. 흐려지고 눌리지 않는다. */
  locked?: boolean;
  /** 끝냈지만 그 뒤 앞 단계가 바뀐 단계. 번호 대신 !를 단다. */
  warn?: boolean;
  /** locked·warn의 이유. 스크린 리더가 읽고, 래퍼가 툴팁으로도 쓴다. */
  hint?: string;
};

type Props = {
  steps: Step[];
  /** 현재 단계의 id */
  current: string;
  /** 세로로 쌓기. 좁은 화면에서 쓴다. */
  vertical?: boolean;
  /** 완료한 단계를 눌러 돌아갈 수 있게 할 때 */
  onStepClick?: (id: string) => void;
  className?: string;
};

export default function StepBar({
  steps,
  current,
  vertical = false,
  onStepClick,
  className = "",
}: Props) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <nav
      className={["step-bar", vertical ? "step-bar--vertical" : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-label="진행 단계"
    >
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        /* Only what is behind you. Going back to a finished step is
           revisiting; jumping ahead to an unlocked one is starting work
           out of order, which the bar should not offer. */
        const clickable = done && !step.locked && !!onStepClick;

        const item = (
          <span
            className={[
              "step-bar__item",
              done ? "step-bar__item--done" : "",
              active ? "step-bar__item--active" : "",
              step.locked ? "step-bar__item--locked" : "",
              step.warn ? "step-bar__item--warn" : "",
              clickable ? "step-bar__item--clickable" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={active ? "step" : undefined}
            aria-disabled={step.locked || undefined}
            /*
              A span that answers a click has to answer a key too, or the
              bar is reachable with a pointer and with nothing else.
            */
            role={clickable ? "link" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onStepClick(step.id) : undefined}
            onKeyDown={
              clickable
                ? (event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    onStepClick(step.id);
                  }
                : undefined
            }
          >
            <span className="step-bar__num" aria-hidden="true">
              <i>{step.warn ? "!" : i + 1}</i>
              <svg viewBox="0 0 14 14">
                <path
                  d="M2.6 7.3l2.7 2.7L11.2 4"
                  stroke="#FFFFFF"
                  strokeWidth="2.3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="step-bar__label">{step.label}</span>
            <span className="sr-only">
              {step.hint
                ? ` (${step.hint})`
                : done
                  ? " (완료)"
                  : active
                    ? " (현재 단계)"
                    : ""}
            </span>
          </span>
        );

        return (
          <React.Fragment key={step.id}>
            {i > 0 && <span className="step-bar__line" aria-hidden="true" />}
            {step.wrap ? step.wrap(item) : item}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
