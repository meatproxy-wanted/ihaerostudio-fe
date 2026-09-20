"use client";

import * as React from "react";
import "./empty-illustration.css";

export type EmptyVariant =
  | "empty" // 아직 만든 자료가 없음
  | "upload" // 판결문 올리기 대기
  | "generating" // 만드는 중
  | "error" // 불러오지 못함
  | "done"; // 검토할 항목 없음

type Props = {
  variant?: EmptyVariant;
  /** 그려질 너비(px). 빈 화면에는 120~180 사이를 권한다. */
  width?: number;
  /** 클릭 가능한 자리에 놓을 때. 커서와 누름 반응이 붙는다. */
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
};

const LABEL: Record<EmptyVariant, string> = {
  empty: "아직 만든 자료가 없어요",
  upload: "판결문을 올려 주세요",
  generating: "자료를 만들고 있어요",
  error: "불러오지 못했어요",
  done: "검토할 항목이 없어요",
};

export default function EmptyIllustration({
  variant = "empty",
  width = 180,
  interactive = false,
  onClick,
  className = "",
}: Props) {
  const uid = React.useId().replace(/:/g, "");
  const g = (n: string) => `${n}-${uid}`;

  const classes = [
    "ei",
    `ei--${variant}`,
    interactive ? "ei--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      style={{ width }}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <svg viewBox="-18 -14 236 194" role="img" aria-label={LABEL[variant]}>
        <defs>
          <linearGradient id={g("lav")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D6CEF9" />
            <stop offset="100%" stopColor="#A6B4EF" />
          </linearGradient>
          <linearGradient id={g("lavDeep")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B93F0" />
            <stop offset="100%" stopColor="#6E8BF0" />
          </linearGradient>
          <linearGradient id={g("blu")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E4F2FE" />
            <stop offset="100%" stopColor="#AFD8F7" />
          </linearGradient>
          <linearGradient id={g("bluDeep")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#BFE6FB" />
            <stop offset="100%" stopColor="#6CBDF2" />
          </linearGradient>
          <linearGradient id={g("cyan")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8FE7F5" />
            <stop offset="100%" stopColor="#4FB4F0" />
          </linearGradient>
          <linearGradient id={g("pale")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F2F6FE" />
            <stop offset="100%" stopColor="#D3E3F7" />
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
          <filter id={g("shs")} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="5"
              floodColor="#5A6FB0"
              floodOpacity="0.22"
            />
          </filter>
        </defs>

        {variant === "empty" && (
          <>
            <g className="ei__slot ei__slot--a">
              <g className="ei__float ei__float--a" filter={`url(#${g("sh")})`}>
                <g transform="rotate(-8 64 104)">
                  <rect
                    x="24"
                    y="56"
                    width="82"
                    height="96"
                    rx="18"
                    fill={`url(#${g("lav")})`}
                  />
                  <g fill={`url(#${g("lavDeep")})`}>
                    <rect x="38" y="78" width="54" height="15" rx="7" />
                    <rect
                      x="38"
                      y="100"
                      width="54"
                      height="13"
                      rx="6.5"
                      opacity="0.82"
                    />
                    <rect
                      x="38"
                      y="120"
                      width="42"
                      height="13"
                      rx="6.5"
                      opacity="0.64"
                    />
                  </g>
                </g>
              </g>
            </g>
            <g className="ei__slot ei__slot--b">
              <g className="ei__float ei__float--b" filter={`url(#${g("sh")})`}>
                <g transform="rotate(7 146 106)">
                  <path
                    d="M110 70a16 16 0 0 1 16-16h32l24 24v68a16 16 0 0 1-16 16h-40a16 16 0 0 1-16-16z"
                    fill={`url(#${g("blu")})`}
                  />
                  <path d="M158 54v24h24z" fill="#FFFFFF" fillOpacity="0.72" />
                  <rect
                    x="124"
                    y="84"
                    width="44"
                    height="11"
                    rx="5.5"
                    fill="#FFFFFF"
                    fillOpacity="0.92"
                  />
                  <rect
                    x="124"
                    y="101"
                    width="34"
                    height="11"
                    rx="5.5"
                    fill="#FFFFFF"
                    fillOpacity="0.75"
                  />
                  <rect
                    x="124"
                    y="119"
                    width="50"
                    height="34"
                    rx="10"
                    fill={`url(#${g("bluDeep")})`}
                  />
                </g>
              </g>
            </g>
          </>
        )}

        {variant === "upload" && (
          <>
            <g className="ei__slot ei__slot--a">
              <g className="ei__float ei__float--a" filter={`url(#${g("sh")})`}>
                <g transform="rotate(-7 74 96)">
                  <rect
                    x="34"
                    y="42"
                    width="80"
                    height="100"
                    rx="17"
                    fill={`url(#${g("lav")})`}
                  />
                  <g fill={`url(#${g("lavDeep")})`} opacity="0.8">
                    <rect x="48" y="62" width="52" height="10" rx="5" />
                    <rect
                      x="48"
                      y="78"
                      width="40"
                      height="10"
                      rx="5"
                      opacity="0.75"
                    />
                    <rect
                      x="48"
                      y="94"
                      width="46"
                      height="10"
                      rx="5"
                      opacity="0.55"
                    />
                  </g>
                </g>
              </g>
            </g>
            <g className="ei__slot ei__slot--b">
              <g className="ei__float ei__float--b" filter={`url(#${g("sh")})`}>
                <g transform="rotate(6 140 92)">
                  <rect
                    x="104"
                    y="46"
                    width="72"
                    height="92"
                    rx="16"
                    fill={`url(#${g("pale")})`}
                    stroke="#9FC4EC"
                    strokeOpacity="0.75"
                    strokeWidth="2"
                    strokeDasharray="7 6"
                  />
                  <circle
                    cx="140"
                    cy="92"
                    r="22"
                    fill={`url(#${g("cyan")})`}
                    opacity="0.9"
                  />
                  <path
                    d="M140 82v20M132 90l8-8 8 8"
                    stroke="#FFFFFF"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </g>
              </g>
            </g>
          </>
        )}

        {variant === "generating" && (
          <>
            <g className="ei__slot ei__slot--a">
              <g className="ei__float ei__float--a" filter={`url(#${g("sh")})`}>
                <g transform="rotate(-6 70 92)">
                  <rect
                    x="30"
                    y="40"
                    width="80"
                    height="100"
                    rx="17"
                    fill={`url(#${g("lav")})`}
                  />
                  <g fill={`url(#${g("lavDeep")})`} opacity="0.75">
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
                    fill={`url(#${g("lavDeep")})`}
                    opacity="0.35"
                  />
                </g>
              </g>
            </g>
            <g className="ei__slot ei__slot--b">
              <g className="ei__float ei__float--b" filter={`url(#${g("sh")})`}>
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
                    fill="#FFFFFF"
                    fillOpacity="0.85"
                  />
                  <rect
                    x="120"
                    y="83"
                    width="32"
                    height="9"
                    rx="4.5"
                    fill="#FFFFFF"
                    fillOpacity="0.65"
                  />
                  <rect
                    className="ei__shimmer"
                    x="120"
                    y="100"
                    width="46"
                    height="28"
                    rx="8"
                    fill={`url(#${g("bluDeep")})`}
                  />
                </g>
              </g>
            </g>
            <path
              className="ei__spark"
              d="M168 24c1.8 13 6.6 18.6 19 21-12.4 2.4-17.2 8-19 21-1.8-13-6.6-18.6-19-21 12.4-2.4 17.2-8 19-21Z"
              fill={`url(#${g("cyan")})`}
            />
            <path
              className="ei__spark ei__spark--2"
              d="M32 18c1 7.5 3.8 10.7 11 12-7.2 1.4-10 4.6-11 12-1-7.5-3.8-10.7-11-12 7.2-1.4 10-4.6 11-12Z"
              fill={`url(#${g("cyan")})`}
              opacity="0.6"
            />
          </>
        )}

        {variant === "error" && (
          <>
            <g className="ei__slot ei__slot--a">
              <g className="ei__float ei__float--a" filter={`url(#${g("sh")})`}>
                <g transform="rotate(-8 78 94)">
                  <rect
                    x="38"
                    y="44"
                    width="80"
                    height="98"
                    rx="17"
                    fill={`url(#${g("pale")})`}
                  />
                  <g fill="#A9B6D8" opacity="0.55">
                    <rect x="52" y="64" width="50" height="10" rx="5" />
                    <rect x="52" y="80" width="34" height="10" rx="5" />
                  </g>
                </g>
              </g>
            </g>
            <g className="ei__slot ei__slot--b">
              <g
                className="ei__float ei__float--b"
                filter={`url(#${g("shs")})`}
              >
                <g transform="rotate(9 140 96)">
                  <rect
                    x="108"
                    y="52"
                    width="70"
                    height="88"
                    rx="16"
                    fill={`url(#${g("pale")})`}
                  />
                </g>
              </g>
            </g>
            <g className="ei__badge">
              <circle
                cx="100"
                cy="36"
                r="13"
                fill={`url(#${g("lavDeep")})`}
                opacity="0.85"
              />
              <path
                d="M100 30v7M100 42v.5"
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          </>
        )}

        {variant === "done" && (
          <>
            <g className="ei__slot ei__slot--a">
              <g className="ei__float ei__float--a" filter={`url(#${g("sh")})`}>
                <g transform="rotate(-5 76 92)">
                  <rect
                    x="36"
                    y="40"
                    width="82"
                    height="100"
                    rx="17"
                    fill={`url(#${g("blu")})`}
                  />
                  <g fill="#FFFFFF" fillOpacity="0.85">
                    <rect x="52" y="62" width="50" height="10" rx="5" />
                    <rect x="52" y="80" width="38" height="10" rx="5" />
                    <rect x="52" y="98" width="44" height="10" rx="5" />
                  </g>
                </g>
              </g>
            </g>
            <g className="ei__slot ei__slot--b">
              <g className="ei__float ei__float--b" filter={`url(#${g("sh")})`}>
                <g transform="rotate(8 146 100)">
                  <circle
                    cx="146"
                    cy="100"
                    r="34"
                    fill={`url(#${g("cyan")})`}
                    opacity="0.95"
                  />
                  <path
                    className="ei__check"
                    d="M132 100l10 10 18-20"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </g>
              </g>
            </g>
          </>
        )}
      </svg>
    </span>
  );
}
