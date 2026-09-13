"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { springs } from "@/hooks/use-press-scale";

const DRAG_THRESHOLD = 4;

/**
 * Horizontal scrolling for the pill without a visible scrollbar: the wheel
 * scrolls it sideways, and a mouse can grab and drag it. A drag swallows the
 * click that would otherwise fire on release.
 */
function useDragScroll<T extends HTMLElement>() {
  const drag = React.useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = React.useRef(false);
  const [dragging, setDragging] = React.useState(false);
  const [overflowing, setOverflowing] = React.useState(false);

  // The scroller mounts and unmounts with `open`, so wire the observer and
  // the wheel listener through a callback ref instead of a mount effect.
  const ref = React.useCallback((element: T | null) => {
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setOverflowing(element.scrollWidth > element.clientWidth + 1);
    });
    observer.observe(element);

    const onWheel = (event: WheelEvent) => {
      if (element.scrollWidth <= element.clientWidth) return;
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        element.scrollLeft += event.deltaY;
        event.preventDefault();
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      observer.disconnect();
      element.removeEventListener("wheel", onWheel);
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent<T>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const element = event.currentTarget;
    if (element.scrollWidth <= element.clientWidth) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: element.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<T>) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    const delta = event.clientX - current.startX;
    if (!current.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      current.moved = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.currentTarget.scrollLeft = current.scrollLeft - delta;
  };

  const onPointerEnd = (event: React.PointerEvent<T>) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    if (current.moved) {
      suppressClick.current = true;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
    drag.current = null;
    setDragging(false);
  };

  const onClickCapture = (event: React.MouseEvent<T>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.stopPropagation();
    event.preventDefault();
  };

  return {
    ref,
    dragging,
    overflowing,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture,
    },
  };
}

type FloatingToolbarProps = React.ComponentProps<"div"> & {
  /** Show or hide the toolbar. It animates in from below and out again. */
  open: boolean;
  /**
   * Called from the floating close button next to the pill and when the user
   * presses Escape. Omit it to hide the close button.
   */
  onDismiss?: () => void;
  /** Where the toolbar floats. */
  side?: "bottom" | "top";
  /** Accessible name of the close button. */
  closeLabel?: string;
};

/**
 * A pill that floats above the page (bottom center by default), for actions
 * that apply to the current selection. Rendered in a portal so it is never
 * clipped by scrolling panels. When it overflows a narrow screen it scrolls
 * sideways without a scrollbar and can be dragged with the mouse.
 */
function FloatingToolbar({
  open,
  onDismiss,
  side = "bottom",
  closeLabel = "닫기",
  className,
  children,
  ...props
}: FloatingToolbarProps) {
  const [container] = React.useState<HTMLElement | null>(() =>
    typeof document === "undefined" ? null : document.body,
  );
  const {
    ref: scrollerRef,
    dragging,
    overflowing,
    handlers: scrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  React.useEffect(() => {
    if (!open || !onDismiss) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        onDismiss();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onDismiss]);

  if (!container) return null;

  const offset = side === "bottom" ? 16 : -16;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          data-slot="floating-toolbar-viewport"
          data-side={side}
          className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 data-[side=bottom]:bottom-6 data-[side=top]:top-6"
        >
          <motion.div
            data-slot="floating-toolbar-group"
            initial={{ opacity: 0, y: offset, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: offset * 0.75,
              scale: 0.98,
              transition: { ...springs.quick, opacity: { duration: 0.12 } },
            }}
            transition={springs.quick}
            className="flex max-w-full items-center gap-2"
          >
            <div
              ref={scrollerRef}
              role="toolbar"
              data-slot="floating-toolbar"
              data-overflowing={overflowing || undefined}
              data-dragging={dragging || undefined}
              className={cn(
                "pointer-events-auto no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto rounded-full bg-popover/85 p-1.5 pl-2 text-sm text-popover-foreground shadow-popover ring-1 ring-border backdrop-blur-xl data-dragging:cursor-grabbing data-dragging:select-none data-dragging:**:cursor-grabbing data-overflowing:cursor-grab supports-[not(backdrop-filter:blur(0))]:bg-popover",
                className,
              )}
              {...scrollHandlers}
              {...props}
            >
              {children}
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={closeLabel}
                data-slot="floating-toolbar-close"
                onClick={onDismiss}
                className="pointer-events-auto size-9 shrink-0 self-center rounded-full bg-popover/85 text-foreground shadow-popover ring-1 ring-border backdrop-blur-xl hover:bg-popover supports-[not(backdrop-filter:blur(0))]:bg-popover"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </Button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    container,
  );
}

function FloatingToolbarLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="floating-toolbar-label"
      className={cn(
        "flex shrink-0 items-center gap-2 pr-2 pl-1 text-2sm font-semibold whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

function FloatingToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="floating-toolbar-separator"
      orientation="vertical"
      className={cn("mx-0.5 h-4 shrink-0 data-vertical:self-center", className)}
      {...props}
    />
  );
}

function FloatingToolbarButton({
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="floating-toolbar-button"
      variant={variant}
      size={size}
      className={cn("shrink-0 rounded-full", className)}
      {...props}
    />
  );
}

export {
  FloatingToolbar,
  FloatingToolbarButton,
  FloatingToolbarLabel,
  FloatingToolbarSeparator,
};
