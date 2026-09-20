"use client";

import { useEffect, useRef, useState } from "react";
import { usePanelRef, type PanelSize } from "react-resizable-panels";
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";

/** Production screens are laid out for 1280px; below that the source folds. */
const NARROW_WORKSPACE = "(max-width: 1279px)";

/**
 * A collapsible source pane for the side-by-side screens. It folds when the
 * window gets narrow and unfolds when it widens again; a wide window on
 * arrival keeps the producer's saved layout.
 *
 * `openOnArrival` overrides that for a screen whose whole point is reading
 * against the original: it opens the pane every time the screen loads,
 * whatever the saved layout remembers and however narrow the window is.
 * Folding on a later resize still works — the override is about arriving,
 * not about staying open.
 */
export function useSourceFold({ openOnArrival = false } = {}) {
  const panelRef = usePanelRef();
  const [collapsed, setCollapsed] = useState(false);
  const narrow = useMediaQuery(NARROW_WORKSPACE);
  const wasNarrow = useRef<boolean | null>(null);

  useEffect(() => {
    const previous = wasNarrow.current;
    wasNarrow.current = narrow;

    if (previous === null) {
      if (openOnArrival) panelRef.current?.expand();
      else if (narrow) panelRef.current?.collapse();
      return;
    }

    if (narrow === previous) return;
    if (narrow) panelRef.current?.collapse();
    else panelRef.current?.expand();
  }, [narrow, openOnArrival, panelRef]);

  return {
    collapsed,
    /** Spread onto the source `ResizablePanel`. */
    panelProps: {
      panelRef,
      collapsible: true,
      collapsedSize: "0",
      onResize: (size: PanelSize) => setCollapsed(size.asPercentage === 0),
    },
    toggle: () =>
      collapsed ? panelRef.current?.expand() : panelRef.current?.collapse(),
  };
}

export function SourceFoldButton({
  fold,
  size = "xs",
}: {
  fold: ReturnType<typeof useSourceFold>;
  /**
   * The editor's canvas toolbar is dense and runs on `xs`; the structure
   * header sits beside a full-size settings button and asks for `sm`.
   */
  size?: "xs" | "sm";
}) {
  return (
    <Button
      variant="secondary"
      size={size}
      aria-expanded={!fold.collapsed}
      onClick={fold.toggle}
    >
      <HugeiconsIcon
        icon={SidebarLeftIcon}
        strokeWidth={2}
        data-icon="inline-start"
      />
      {fold.collapsed ? "원문 펼치기" : "원문 접기"}
    </Button>
  );
}

/**
 * The same control as an icon, for the source pane's own header. Folding
 * the pane is something you do *to* the pane, so it belongs on it — but
 * once folded the pane is gone, and with it the way back. The screens pair
 * this with the labelled button, which they show only while it is shut.
 */
export function SourceFoldIcon({
  fold,
}: {
  fold: ReturnType<typeof useSourceFold>;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-expanded={!fold.collapsed}
            aria-label="원문 접기"
            className="text-muted-foreground"
            onClick={fold.toggle}
          />
        }
      >
        <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} />
      </TooltipTrigger>
      <TooltipContent side="bottom">원문 접기</TooltipContent>
    </Tooltip>
  );
}
