"use client";

import * as React from "react";
import "./generation-loading.css";

export type GenerationStage =
  | "reading" // 판결문 읽기
  | "structure" // 사건 구조 정리
  | "rewrite" // 쉬운 문장으로 바꾸기
  | "illustrate" // 그림 만들기
  | "done";

const ORDER: GenerationStage[] = [
  "reading",
  "structure",
  "rewrite",
  "illustrate",
];

const COPY: Record<
  GenerationStage,
  { title: string; desc: string; label: string }
> = {
  reading: {
    title: "판결문을 읽고 있어요",
    desc: "문서를 열어 문장 단위로 나누는 중입니다.",
    label: "판결문 읽기",
  },
  structure: {
    title: "사건 구조를 정리하고 있어요",
    desc: "누가 무엇을 다퉜는지, 법원이 어떻게 판단했는지 찾습니다.",
    label: "사건 구조 정리",
  },
  rewrite: {
    title: "쉬운 문장으로 바꾸고 있어요",
    desc: "긴 문장을 짧게 나누고 어려운 말을 풀어 씁니다.",
    label: "쉬운 문장으로 바꾸기",
  },
  illustrate: {
    title: "그림을 만들고 있어요",
    desc: "문장마다 어울리는 그림을 한 장씩 그립니다.",
    label: "그림 만들기",
  },
  done: {
    title: "다 만들었어요",
    desc: "이제 원문과 대조하며 다듬을 수 있습니다.",
    label: "완료",
  },
};

type Props = {
  /** 현재 단계. 서버 상태를 그대로 넘긴다. */
  stage: GenerationStage;
  /** 전체 진행률 0~100. 서버가 주지 않으면 단계로 대략 계산된다. */
  progress?: number;
  /** 사건번호·문서명 */
  documentLabel?: string;
  /** 현재 단계의 처리량. 예: { current: 6, total: 14 } */
  count?: { current: number; total: number };
  /** 남은 시간 문구. 예: "약 1분 남음" */
  eta?: string;
  /**
   * 맨 아래 한 줄. 이 앱은 생성이 클라이언트에서 진행돼 화면을 닫으면
   * 멈추므로 기본 문구도 그렇게 적혀 있다. 서버가 작업을 이어받게 되면
   * 그때 바꾸면 된다.
   */
  hint?: React.ReactNode;
  className?: string;
};

/** 단계별 진행률 상한 — 서버가 progress를 주지 않을 때의 근사치 */
const FALLBACK: Record<GenerationStage, number> = {
  reading: 12,
  structure: 32,
  rewrite: 56,
  illustrate: 88,
  done: 100,
};

export default function GenerationLoading({
  stage,
  progress,
  documentLabel,
  count,
  eta,
  hint = "이 화면을 닫으면 생성이 멈춰요. 완성되면 작업함에서 이어 다듬을 수 있어요.",
  className = "",
}: Props) {
  const uid = React.useId().replace(/:/g, "");
  const g = (n: string) => `${n}-${uid}`;
  const pct = Math.max(0, Math.min(100, progress ?? FALLBACK[stage]));
  const activeIndex = stage === "done" ? ORDER.length : ORDER.indexOf(stage);
  const copy = COPY[stage];

  const unit = stage === "illustrate" ? "장" : "문장";

  return (
    <div className={`gl ${className}`} role="status" aria-live="polite">
      <div className="gl__dots" aria-hidden="true" />
      <div className="gl__corner gl__corner--a" aria-hidden="true" />
      <div className="gl__corner gl__corner--b" aria-hidden="true" />

      <div className="gl__panel">
        {documentLabel && <span className="gl__doc">{documentLabel}</span>}

        <div className="gl__art" aria-hidden="true">
          <svg
            viewBox="-18 -14 236 194"
            style={{ width: "100%", height: "auto", overflow: "visible" }}
          >
            <defs>
              <linearGradient id={g("lav")} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D6CEF9" />
                <stop offset="100%" stopColor="#A6B4EF" />
              </linearGradient>
              <linearGradient id={g("lavD")} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9B93F0" />
                <stop offset="100%" stopColor="#6E8BF0" />
              </linearGradient>
              <linearGradient id={g("blu")} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E4F2FE" />
                <stop offset="100%" stopColor="#AFD8F7" />
              </linearGradient>
              <linearGradient id={g("bluD")} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#BFE6FB" />
                <stop offset="100%" stopColor="#6CBDF2" />
              </linearGradient>
              <linearGradient id={g("cy")} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8FE7F5" />
                <stop offset="100%" stopColor="#4FB4F0" />
              </linearGradient>
              <filter id={g("sh")} x="-60%" y="-60%" width="220%" height="220%">
                <feDropShadow
                  dx="0"
                  dy="6"
                  stdDeviation="7"
                  floodColor="#5A6FB0"
                  floodOpacity="0.26"
                />
              </filter>
            </defs>

            <g className="gl__float gl__float--a" filter={`url(#${g("sh")})`}>
              <g transform="rotate(-6 70 92)">
                <rect
                  x="30"
                  y="40"
                  width="80"
                  height="100"
                  rx="17"
                  fill={`url(#${g("lav")})`}
                />
                <g fill={`url(#${g("lavD")})`} opacity="0.75">
                  <rect x="44" y="60" width="50" height="10" rx="5" />
                  <rect
                    x="44"
                    y="76"
                    width="36"
                    height="10"
                    rx="5"
                    opacity="0.7"
                  />
                </g>
                <rect
                  x="44"
                  y="96"
                  width="52"
                  height="30"
                  rx="8"
                  fill={`url(#${g("lavD")})`}
                  opacity="0.35"
                />
              </g>
            </g>
            <g className="gl__float gl__float--b" filter={`url(#${g("sh")})`}>
              <g transform="rotate(8 142 96)">
                <rect
                  x="106"
                  y="50"
                  width="74"
                  height="92"
                  rx="16"
                  fill={`url(#${g("blu")})`}
                />
                <rect
                  x="120"
                  y="68"
                  width="46"
                  height="9"
                  rx="4.5"
                  fill="#fff"
                  fillOpacity="0.85"
                />
                <rect
                  x="120"
                  y="83"
                  width="32"
                  height="9"
                  rx="4.5"
                  fill="#fff"
                  fillOpacity="0.65"
                />
                <rect
                  className="gl__shimmer"
                  x="120"
                  y="100"
                  width="46"
                  height="28"
                  rx="8"
                  fill={`url(#${g("bluD")})`}
                />
              </g>
            </g>
            <path
              className="gl__spark"
              d="M168 24c1.8 13 6.6 18.6 19 21-12.4 2.4-17.2 8-19 21-1.8-13-6.6-18.6-19-21 12.4-2.4 17.2-8 19-21Z"
              fill={`url(#${g("cy")})`}
            />
            <path
              className="gl__spark gl__spark--2"
              d="M32 18c1 7.5 3.8 10.7 11 12-7.2 1.4-10 4.6-11 12-1-7.5-3.8-10.7-11-12 7.2-1.4 10-4.6 11-12Z"
              fill={`url(#${g("cy")})`}
              opacity="0.6"
            />
          </svg>
        </div>

        <h2 className="gl__title">{copy.title}</h2>
        <p className="gl__desc">{copy.desc}</p>

        <div className="gl__track">
          <div className="gl__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="gl__pct">
          <span>{Math.round(pct)}%</span>
          <span>{stage === "done" ? "완료" : (eta ?? "")}</span>
        </div>

        <ol className="gl__steps">
          {ORDER.map((s, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <li
                key={s}
                className={[
                  "gl__step",
                  done ? "gl__step--done" : "",
                  active ? "gl__step--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="gl__dot" aria-hidden="true">
                  <svg viewBox="0 0 12 12">
                    <path
                      d="M2 6l3 3 5-6"
                      stroke="#fff"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {COPY[s].label}
                <span className="gl__count">
                  {active && count
                    ? `${count.current} / ${count.total}${unit}`
                    : ""}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="gl__hint">{hint}</p>
      </div>
    </div>
  );
}

/** 목록 안에서 쓰는 축약형 */
export function GenerationLoadingInline({
  stage,
  count,
  eta,
  className = "",
}: Pick<Props, "stage" | "count" | "eta" | "className">) {
  const unit = stage === "illustrate" ? "장" : "문장";
  const detail = [
    count ? `${count.total}${unit} 중 ${count.current}${unit}` : null,
    eta,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`gl-inline ${className}`} role="status" aria-live="polite">
      <span className="gl-inline__ring" aria-hidden="true" />
      <span className="gl-inline__text">
        <b>{COPY[stage].title.replace("있어요", "있습니다")}</b>
        <span>{detail}</span>
      </span>
    </div>
  );
}
