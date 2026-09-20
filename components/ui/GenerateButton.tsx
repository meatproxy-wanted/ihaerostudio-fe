"use client";

import * as React from "react";
import "./generate-button.css";

type GenerateButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 라벨 길이에 맞춰 폭이 늘어난다. 한글 라벨은 기본적으로 이쪽. */
  hug?: boolean;
  /** 생성 중 상태. 아이콘이 맥동하고 클릭이 막힌다. */
  loading?: boolean;
  /** 기본 아이콘을 교체할 때. */
  icon?: React.ReactNode;
  /** 프레임(바깥 여백 레이어)에 붙일 클래스. */
  frameClassName?: string;
};

const GenerateButton = React.forwardRef<HTMLButtonElement, GenerateButtonProps>(
  function GenerateButton(
    {
      children,
      hug = false,
      loading = false,
      icon = "✦",
      disabled,
      className = "",
      frameClassName = "",
      ...props
    },
    ref,
  ) {
    return (
      <span className={`gb-frame ${frameClassName}`}>
        <span className="gb-ring">
          <button
            ref={ref}
            type="button"
            className={`gb ${hug ? "gb--hug" : ""} ${className}`}
            data-loading={loading ? "true" : undefined}
            aria-busy={loading || undefined}
            disabled={disabled || loading}
            {...props}
          >
            <i className="gb-lift" aria-hidden="true" />
            <span className="gb__label">{children}</span>
            <span className="gb__icon" aria-hidden="true">
              {icon}
            </span>
          </button>
        </span>
      </span>
    );
  },
);

export default GenerateButton;
