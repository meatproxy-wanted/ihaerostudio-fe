"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[5px] border border-transparent font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-[1.1em]!",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary-text [a]:hover:bg-primary/25",
        solid: "bg-primary text-primary-foreground [a]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-muted-foreground shadow-[inset_0_0_0_0.75px_var(--hairline)] [a]:hover:bg-accent [a]:hover:text-foreground",
        outline:
          "border-input text-foreground [a]:hover:bg-accent [a]:hover:text-foreground",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        destructive: "bg-destructive/10 text-destructive",
        positive: "bg-positive/10 text-positive",
        negative: "bg-negative/10 text-negative",
        warning: "bg-warning/12 text-warning",
        success: "bg-success/10 text-success",
        neutral: "bg-foreground text-background",
        link: "text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-4 px-1 text-[11px]/4",
        default: "h-5 px-1.5 text-xs",
        lg: "h-6 rounded-sm px-2 text-2sm font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  });
}

export { Badge, badgeVariants };
