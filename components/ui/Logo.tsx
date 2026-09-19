"use client";

import * as React from "react";
import "./logo.css";

type LogoProps = {
  /** 기준 크기(px). 텍스트 폰트 크기이자 전체 비율의 기준. 기본 64. */
  size?: number;
  /** 조합 형태 */
  layout?: "full" | "symbol-only" | "text-only" | "stacked";
  /** 글자 색. brand = 먹색, white = 컬러 면 위 */
  tone?: "brand" | "white";
  /**
   * 심볼을 단색(currentColor)으로. 파비콘, 인쇄, 20px 이하처럼
   * 그라디언트가 뭉개지는 자리에 쓴다.
   */
  monochrome?: boolean;
  className?: string;
};

/** 겹친 두 타원 — 위는 원문, 아래는 쉬운 자료, 겹친 자리가 이해 */
function Symbol({ mono }: { mono: boolean }) {
  const uid = React.useId().replace(/:/g, "");
  const up = `up-${uid}`;
  const dn = `dn-${uid}`;
  const ov = `ov-${uid}`;
  const clip = `clip-${uid}`;

  const UP = { cx: 62, cy: 46, rx: 42, ry: 27, rot: -20 };
  const DN = { cx: 58, cy: 74, rx: 42, ry: 27, rot: -20 };

  if (mono) {
    return (
      <svg className="logo__symbol" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <clipPath id={clip}>
            <ellipse
              cx={UP.cx}
              cy={UP.cy}
              rx={UP.rx}
              ry={UP.ry}
              transform={`rotate(${UP.rot} ${UP.cx} ${UP.cy})`}
            />
          </clipPath>
        </defs>
        <ellipse
          cx={UP.cx}
          cy={UP.cy}
          rx={UP.rx}
          ry={UP.ry}
          transform={`rotate(${UP.rot} ${UP.cx} ${UP.cy})`}
          fill="currentColor"
          opacity="0.45"
        />
        <ellipse
          cx={DN.cx}
          cy={DN.cy}
          rx={DN.rx}
          ry={DN.ry}
          transform={`rotate(${DN.rot} ${DN.cx} ${DN.cy})`}
          fill="currentColor"
          opacity="0.7"
        />
        <g clipPath={`url(#${clip})`}>
          <ellipse
            cx={DN.cx}
            cy={DN.cy}
            rx={DN.rx}
            ry={DN.ry}
            transform={`rotate(${DN.rot} ${DN.cx} ${DN.cy})`}
            fill="currentColor"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg className="logo__symbol" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id={up} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7FF0E8" stopOpacity="1" />
          <stop offset="34%" stopColor="#3ED8F5" stopOpacity="0.92" />
          <stop offset="68%" stopColor="#18B4FF" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#7FE9FF" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={dn} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#37D0FF" stopOpacity="1" />
          <stop offset="38%" stopColor="#2E8BFF" stopOpacity="0.92" />
          <stop offset="72%" stopColor="#8C86FF" stopOpacity="0.58" />
          <stop offset="100%" stopColor="#C9B8FF" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={ov} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0090FF" stopOpacity="0.95" />
          <stop offset="42%" stopColor="#2050EE" stopOpacity="0.92" />
          <stop offset="78%" stopColor="#4A3FE8" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#7C6BF5" stopOpacity="0.22" />
        </linearGradient>
        <clipPath id={clip}>
          <ellipse
            cx={UP.cx}
            cy={UP.cy}
            rx={UP.rx}
            ry={UP.ry}
            transform={`rotate(${UP.rot} ${UP.cx} ${UP.cy})`}
          />
        </clipPath>
      </defs>

      <ellipse
        cx={UP.cx}
        cy={UP.cy}
        rx={UP.rx}
        ry={UP.ry}
        transform={`rotate(${UP.rot} ${UP.cx} ${UP.cy})`}
        fill={`url(#${up})`}
      />
      <ellipse
        cx={DN.cx}
        cy={DN.cy}
        rx={DN.rx}
        ry={DN.ry}
        transform={`rotate(${DN.rot} ${DN.cx} ${DN.cy})`}
        fill={`url(#${dn})`}
      />
      <g clipPath={`url(#${clip})`}>
        <ellipse
          cx={DN.cx}
          cy={DN.cy}
          rx={DN.rx}
          ry={DN.ry}
          transform={`rotate(${DN.rot} ${DN.cx} ${DN.cy})`}
          fill={`url(#${ov})`}
        />
      </g>
    </svg>
  );
}

export default function Logo({
  size = 64,
  layout = "full",
  tone = "brand",
  monochrome = false,
  className = "",
}: LogoProps) {
  const classes = [
    "logo",
    `logo--${tone}`,
    layout !== "full" ? `logo--${layout}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      style={{ ["--logo-size" as string]: `${size}px` }}
      role="img"
      aria-label="이해로 스튜디오"
    >
      {layout !== "text-only" && <Symbol mono={monochrome} />}
      {layout !== "symbol-only" && (
        <span className="logo__text" aria-hidden="true">
          <span className="logo__mark">IHAERO</span>
          <span className="logo__suffix">Studio</span>
        </span>
      )}
    </span>
  );
}
