"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { useComposedRefs } from "motion/react";

import { cn } from "@/lib/utils";
import { usePressScale } from "@/hooks/use-press-scale";

const strokeDraw =
  "[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-300 ease-out";

/**
 * Checkbox with a drawn-in check: the box pops (bounce) when it becomes
 * checked, the mark scales in and its stroke draws from left to right, and
 * both reverse when unchecked.
 */
function Checkbox({
  className,
  disabled,
  onCheckedChange,
  onAnimationEnd,
  ref,
  ...props
}: CheckboxPrimitive.Root.Props) {
  const [bouncing, setBouncing] = React.useState(false);
  const { ref: pressRef } = usePressScale<HTMLElement>({
    disabled: !!disabled,
    scale: 0.92,
  });
  const composedRef = useComposedRefs(ref, pressRef);

  return (
    <CheckboxPrimitive.Root
      ref={composedRef}
      data-slot="checkbox"
      disabled={disabled}
      onCheckedChange={(checked, details) => {
        if (checked) setBouncing(true);
        onCheckedChange?.(checked, details);
      }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setBouncing(false);
        onAnimationEnd?.(event);
      }}
      className={cn(
        "group/checkbox peer relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-input bg-card transition-[background-color,border-color,box-shadow,scale] duration-200 will-change-transform outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 hover:scale-105 hover:border-[color-mix(in_oklab,var(--input),var(--foreground)_15%)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 aria-invalid:aria-checked:border-primary data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary data-disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:hover:scale-100 data-disabled:data-unchecked:bg-muted",
        bouncing && "animate-checkbox-bounce",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className="grid scale-0 place-content-center text-current transition-transform duration-200 ease-out group-data-indeterminate/checkbox:scale-100 group-data-checked/checkbox:scale-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-3.5"
        >
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            pathLength={1}
            className={cn(
              strokeDraw,
              "group-data-checked/checkbox:delay-100 group-data-checked/checkbox:[stroke-dashoffset:0]",
            )}
          />
          <path
            d="M6 12h12"
            pathLength={1}
            className={cn(
              strokeDraw,
              "group-data-indeterminate/checkbox:delay-100 group-data-indeterminate/checkbox:[stroke-dashoffset:0]",
            )}
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
