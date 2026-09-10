"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { useComposedRefs } from "motion/react";

import { cn } from "@/lib/utils";
import { usePressScale } from "@/hooks/use-press-scale";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-3 data-horizontal:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default:
          "isolate bg-muted shadow-[inset_0_0_0_0.75px_var(--hairline)] [--tabs-indicator-radius:7px]",
        line: "gap-1 rounded-none group-data-horizontal/tabs:w-full group-data-horizontal/tabs:justify-start group-data-horizontal/tabs:border-b group-data-vertical/tabs:border-r",
        pill: "gap-1 rounded-none",
      },
      size: {
        default: "",
        lg: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        size: "default",
        class: "rounded-[10px] p-[3px] group-data-horizontal/tabs:h-8",
      },
      {
        variant: "default",
        size: "lg",
        class:
          "rounded-[14px] px-[5px] py-1 group-data-horizontal/tabs:h-10 [--tabs-indicator-radius:10px]",
      },
      {
        variant: "line",
        size: "default",
        class: "group-data-horizontal/tabs:h-10",
      },
      { variant: "line", size: "lg", class: "group-data-horizontal/tabs:h-11" },
      {
        variant: "pill",
        size: "default",
        class: "group-data-horizontal/tabs:h-9",
      },
      { variant: "pill", size: "lg", class: "group-data-horizontal/tabs:h-10" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * The active-tab marker. Base UI exposes the active tab's box as CSS
 * variables, so every variant can slide its marker with the indicator spring:
 * a white card for the segmented control, a grey pill for pill tabs and a
 * 2px underline for line tabs.
 */
const tabsIndicatorVariants = cva(
  "absolute z-0 transition-[left,top,width,height] duration-(--duration-spring-indicator) ease-spring-indicator",
  {
    variants: {
      variant: {
        default:
          "top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width) rounded-(--tabs-indicator-radius) bg-segment shadow-[0_1px_2px_rgba(0,0,0,0.09),0_0_0_0.5px_var(--hairline)]",
        pill: "top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width) rounded-full bg-secondary shadow-[inset_0_0_0_0.5px_var(--hairline)]",
        line: "rounded-full bg-foreground group-data-horizontal/tabs:bottom-0 group-data-horizontal/tabs:left-[calc(var(--active-tab-left)_+_8px)] group-data-horizontal/tabs:h-0.5 group-data-horizontal/tabs:w-[calc(var(--active-tab-width)_-_16px)] group-data-vertical/tabs:top-[calc(var(--active-tab-top)_+_8px)] group-data-vertical/tabs:right-0 group-data-vertical/tabs:h-[calc(var(--active-tab-height)_-_16px)] group-data-vertical/tabs:w-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    >
      <TabsPrimitive.Indicator
        data-slot="tabs-indicator"
        className={tabsIndicatorVariants({ variant })}
      />
      {children}
    </TabsPrimitive.List>
  );
}

function isInactiveTab(element: HTMLElement) {
  return !element.hasAttribute("data-active");
}

function TabsTrigger({
  className,
  children,
  disabled,
  ref,
  ...props
}: TabsPrimitive.Tab.Props) {
  // Scale the label, not the tab: Base UI measures the tab's box to place the
  // indicator, and a transformed tab would be measured mid-press.
  const contentRef = React.useRef<HTMLSpanElement>(null);
  const { ref: pressRef, isPressed } = usePressScale<HTMLElement>({
    disabled: !!disabled,
    scale: 0.92,
    shouldPress: isInactiveTab,
    target: contentRef,
  });
  const composedRef = useComposedRefs(ref, pressRef);

  return (
    <TabsPrimitive.Tab
      ref={composedRef}
      data-slot="tabs-trigger"
      data-pressed={isPressed || undefined}
      disabled={disabled}
      className={cn(
        "group/tabs-trigger relative z-10 inline-flex h-full flex-1 items-center justify-center gap-1.5 overflow-hidden border border-transparent px-3 text-2sm font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,box-shadow] duration-200 outline-none group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:font-semibold data-active:text-foreground group-data-[size=lg]/tabs-list:px-3.5 group-data-[size=lg]/tabs-list:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Segmented control (default): the sliding indicator draws the card.
        "group-data-[variant=default]/tabs-list:rounded-(--tabs-indicator-radius) group-data-[variant=default]/tabs-list:bg-transparent",
        // Underline tabs: the sliding indicator draws the 2px line.
        "group-data-[variant=line]/tabs-list:h-9 group-data-[variant=line]/tabs-list:flex-none group-data-[variant=line]/tabs-list:rounded-md group-data-[variant=line]/tabs-list:text-sm group-data-[variant=line]/tabs-list:not-data-active:hover:bg-accent group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:self-start",
        // Pill tabs: the sliding indicator draws the grey pill; no hover or press fill.
        "group-data-[variant=pill]/tabs-list:flex-none group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:text-sm",
        className,
      )}
      {...props}
    >
      <span
        ref={contentRef}
        data-slot="tabs-trigger-content"
        className="inline-flex items-center gap-1.5 will-change-transform"
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        data-slot="tabs-trigger-glow"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-foreground)_0%,transparent_100%)] opacity-0 transition-opacity duration-(--duration-spring-quick) ease-spring-quick group-data-pressed/tabs-trigger:opacity-12 group-data-[variant=pill]/tabs-list:hidden"
      />
    </TabsPrimitive.Tab>
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsIndicatorVariants,
};
