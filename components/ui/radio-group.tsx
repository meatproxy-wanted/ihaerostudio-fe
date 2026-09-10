"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { useComposedRefs } from "motion/react";

import { cn } from "@/lib/utils";
import { usePressScale } from "@/hooks/use-press-scale";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-3", className)}
      {...props}
    />
  );
}

/**
 * Radio with an animated selection (after 21st.dev's Ark radio group): the
 * ring fills with the primary color over 200ms while the inner dot fades and
 * scales in; the previously selected radio plays the same in reverse.
 */
function RadioGroupItem({
  className,
  disabled,
  ref,
  ...props
}: RadioPrimitive.Root.Props) {
  const { ref: pressRef } = usePressScale<HTMLElement>({
    disabled: !!disabled,
    scale: 0.92,
  });
  const composedRef = useComposedRefs(ref, pressRef);

  return (
    <RadioPrimitive.Root
      ref={composedRef}
      data-slot="radio-group-item"
      disabled={disabled}
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-card transition-[background-color,border-color,box-shadow,scale] duration-200 ease-out outline-none will-change-transform group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 hover:scale-105 hover:border-[color-mix(in_oklab,var(--input),var(--foreground)_15%)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 data-disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:hover:scale-100 data-disabled:data-unchecked:bg-muted aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        keepMounted
        data-slot="radio-group-indicator"
        className="pointer-events-none block size-2 scale-50 rounded-full bg-current opacity-0 transition-[opacity,scale] duration-200 ease-out group-data-checked/radio-group-item:scale-100 group-data-checked/radio-group-item:opacity-100"
      />
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
