"use client";

import * as React from "react";
import { animate, press, useReducedMotion } from "motion/react";

/** TDS spring presets (stiffness / damping / mass). */
export const springs = {
  quick: { type: "spring", stiffness: 800, damping: 55, mass: 1 },
  rapid: { type: "spring", stiffness: 1000, damping: 55, mass: 1 },
  medium: { type: "spring", stiffness: 270, damping: 25, mass: 1 },
} as const;

type UsePressScaleOptions<T extends HTMLElement> = {
  /** Skip the gesture entirely. */
  disabled?: boolean;
  /** Scale while held. TDS buttons use 0.96, segmented items 0.9. */
  scale?: number;
  /** Decide per press whether the element should react. */
  shouldPress?: (element: T) => boolean;
  /**
   * Element to scale instead of the one receiving the gesture. Use it when
   * the gesture element's box must stay measurable (e.g. tabs whose position
   * feeds an indicator).
   */
  target?: React.RefObject<HTMLElement | null>;
};

/**
 * Toss-style press feedback: shrink with the rapid spring while held and
 * spring back with the quick spring on release or cancel. Returns a ref to
 * attach to the element and whether it is currently held.
 */
export function usePressScale<T extends HTMLElement>({
  disabled = false,
  scale = 0.96,
  shouldPress,
  target,
}: UsePressScaleOptions<T> = {}) {
  const [isPressed, setIsPressed] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();
  const ref = React.useRef<T>(null);
  const shouldPressRef = React.useRef(shouldPress);

  React.useEffect(() => {
    shouldPressRef.current = shouldPress;
  }, [shouldPress]);

  React.useEffect(() => {
    const element = ref.current;

    if (!element || disabled) return;

    return press(element, () => {
      if (shouldPressRef.current && !shouldPressRef.current(element)) {
        return;
      }

      const animated = target?.current ?? element;
      setIsPressed(true);

      if (!shouldReduceMotion) {
        animate(animated, { scale }, springs.rapid);
      }

      return () => {
        setIsPressed(false);

        if (!shouldReduceMotion) {
          animate(animated, { scale: 1 }, springs.quick);
        }
      };
    });
  }, [disabled, scale, shouldReduceMotion, target]);

  return { ref, isPressed, shouldReduceMotion };
}
