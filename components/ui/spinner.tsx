"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * TDS-style loader: a round-capped arc that grows and shrinks while the whole
 * ring rotates. Inherits `currentColor`, so size and color come from className.
 */
function Spinner({
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "strokeWidth">) {
  return (
    <svg
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      viewBox="0 0 66 66"
      fill="none"
      className={cn("size-5 shrink-0 animate-loader-rotate", className)}
      {...props}
    >
      <circle
        cx="33"
        cy="33"
        r="30"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="180"
        className="origin-center animate-loader-dash"
      />
    </svg>
  );
}

export { Spinner };
