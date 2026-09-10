"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

const trendVariants = cva(
  "inline-flex items-center gap-0.5 font-medium whitespace-nowrap tabular-nums [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      trend: {
        up: "text-positive",
        down: "text-negative",
        flat: "text-muted-foreground",
      },
      size: {
        sm: "text-xs",
        default: "text-2sm",
        lg: "text-sm font-semibold",
      },
    },
    defaultVariants: {
      trend: "flat",
      size: "default",
    },
  },
);

const percentFormatter = new Intl.NumberFormat("ko-KR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatSignedPercent(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${percentFormatter.format(Math.abs(value))}%`;
}

function resolveTrend(value: number | undefined) {
  if (value === undefined || value === 0) return "flat" as const;
  return value > 0 ? ("up" as const) : ("down" as const);
}

type TrendProps = React.ComponentProps<"span"> &
  VariantProps<typeof trendVariants> & {
    /** Numeric change. Used to derive direction and, without children, the label. */
    value?: number;
    /** Render a direction arrow before the label. */
    showIcon?: boolean;
    /** Custom formatter for `value`. Defaults to a signed percentage. */
    format?: (value: number) => string;
  };

function Trend({
  className,
  trend,
  size,
  value,
  showIcon = false,
  format = formatSignedPercent,
  children,
  ...props
}: TrendProps) {
  const resolved = trend ?? resolveTrend(value);
  const label = children ?? (value === undefined ? null : format(value));

  return (
    <span
      data-slot="trend"
      data-trend={resolved}
      className={cn(trendVariants({ trend: resolved, size }), className)}
      {...props}
    >
      {showIcon && resolved !== "flat" && (
        <HugeiconsIcon
          icon={resolved === "up" ? ArrowUp01Icon : ArrowDown01Icon}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}

export { Trend, trendVariants, formatSignedPercent };
