"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { useComposedRefs } from "motion/react";

import { cn } from "@/lib/utils";
import { usePressScale } from "@/hooks/use-press-scale";

/**
 * TDS-style switch: the thumb is a small dot when off and grows into a large
 * circle while sliding right when on (medium spring). Holding the track
 * shrinks it to 0.96 and darkens it, like TDS's touch effect.
 */
function Switch({
  className,
  size = "default",
  disabled,
  ref,
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  const { ref: pressRef, isPressed } = usePressScale<HTMLElement>({
    disabled: !!disabled,
    scale: 0.96,
  });
  const composedRef = useComposedRefs(ref, pressRef);

  return (
    <SwitchPrimitive.Root
      ref={composedRef}
      data-slot="switch"
      data-size={size}
      data-pressed={isPressed || undefined}
      disabled={disabled}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-[background-color,box-shadow] duration-(--duration-spring-quick) ease-spring-quick will-change-transform outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 data-checked:bg-primary data-unchecked:bg-muted-foreground/25 data-disabled:cursor-not-allowed data-disabled:opacity-40",
        "data-[size=default]:h-6.5 data-[size=default]:w-11 data-[size=default]:[--switch-thumb-left:6px] data-[size=default]:[--switch-thumb-on:20px] data-[size=default]:[--switch-thumb-x:15px] data-[size=default]:[--switch-thumb:14px]",
        "data-[size=sm]:h-5.5 data-[size=sm]:w-9 data-[size=sm]:[--switch-thumb-left:6px] data-[size=sm]:[--switch-thumb-on:16px] data-[size=sm]:[--switch-thumb-x:11px] data-[size=sm]:[--switch-thumb:10px]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="switch-press-dim"
        className="pointer-events-none absolute inset-0 rounded-full bg-black opacity-0 transition-opacity duration-(--duration-spring-quick) ease-spring-quick group-data-pressed/switch:opacity-20"
      />
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none relative z-10 ml-(--switch-thumb-left) block size-(--switch-thumb) translate-x-0 rounded-full bg-white shadow-[0_1px_1.5px_rgba(0,0,0,0.08)] transition-[width,height,translate] duration-(--duration-spring-medium) ease-spring-medium data-checked:size-(--switch-thumb-on) data-checked:translate-x-(--switch-thumb-x)"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
