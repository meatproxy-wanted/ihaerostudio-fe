"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useComposedRefs } from "motion/react";

import { cn } from "@/lib/utils";
import { springs, usePressScale } from "@/hooks/use-press-scale";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow] outline-none select-none will-change-transform focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),black_5%)] aria-expanded:bg-[color-mix(in_oklab,var(--primary),black_5%)]",
        weak: "bg-primary/25 text-primary-text hover:bg-primary/35 aria-expanded:bg-primary/35",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[inset_0_0_0_0.5px_var(--hairline)] hover:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_5%)]",
        outline:
          "border-input bg-card text-foreground hover:bg-accent aria-expanded:bg-accent",
        ghost:
          "text-foreground hover:bg-accent hover:text-foreground aria-expanded:bg-accent",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/16 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 aria-expanded:bg-destructive/16",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-[color-mix(in_oklab,var(--destructive),black_6%)] focus-visible:border-destructive/40 focus-visible:ring-destructive/25",
        neutral:
          "bg-foreground text-background hover:bg-foreground/92 aria-expanded:bg-foreground/92",
        link: "h-auto rounded-none px-0 text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-[6px] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-[8px] px-3 text-2sm in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-11 gap-2 rounded-lg px-5 text-md has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[6px] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm":
          "size-8 rounded-[8px] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-11 rounded-lg [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;

/**
 * Press feedback per variant, after TDS: solid buttons get a light black dim,
 * tinted ("weak") buttons deepen their own color instead of going grey.
 */
const pressDim: Record<ButtonVariant, { className: string; opacity: number }> =
  {
    default: { className: "bg-black", opacity: 0.14 },
    danger: { className: "bg-black", opacity: 0.14 },
    neutral: { className: "bg-black", opacity: 0.14 },
    secondary: { className: "bg-black", opacity: 0.07 },
    outline: { className: "bg-black", opacity: 0.05 },
    ghost: { className: "bg-black", opacity: 0.05 },
    weak: { className: "bg-primary", opacity: 0.28 },
    destructive: { className: "bg-destructive", opacity: 0.14 },
    link: { className: "bg-transparent", opacity: 0 },
  };

function Button({
  className,
  variant = "default",
  size = "default",
  children,
  disabled,
  ref,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const {
    ref: pressRef,
    isPressed,
    shouldReduceMotion,
  } = usePressScale<HTMLElement>({ disabled: !!disabled });
  const composedRef = useComposedRefs(ref, pressRef);
  const dim = pressDim[variant ?? "default"];

  return (
    <ButtonPrimitive
      ref={composedRef}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled}
      {...props}
    >
      {children}
      <motion.span
        aria-hidden="true"
        data-slot="button-press-dim"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          dim.className,
        )}
        initial={false}
        animate={{ opacity: isPressed && !disabled ? dim.opacity : 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : springs.quick}
      />
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
