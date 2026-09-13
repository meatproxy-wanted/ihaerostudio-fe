"use client";

import { useEffect, useRef, useState } from "react";
import { usePanelRef, type PanelSize } from "react-resizable-panels";
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

/** Production screens are laid out for 1280px; below that the source folds. */
const NARROW_WORKSPACE = "(max-width: 1279px)";

/**
 * A collapsible source pane for the side-by-side screens. It folds when the
 * window gets narrow and unfolds when it widens again; a wide window on
 * arrival keeps the producer's saved layout.
 */
export function useSourceFold() {
  const panelRef = usePanelRef();
  const [collapsed, setCollapsed] = useState(false);
  const narrow = useMediaQuery(NARROW_WORKSPACE);
  const wasNarrow = useRef<boolean | null>(null);

  useEffect(() => {
    const previous = wasNarrow.current;
    wasNarrow.current = narrow;
    if (narrow === (previous ?? false)) return;
    if (narrow) panelRef.current?.collapse();
    else panelRef.current?.expand();
  }, [narrow, panelRef]);

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
}: {
  fold: ReturnType<typeof useSourceFold>;
}) {
  return (
    <Button
      variant="secondary"
      size="xs"
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
