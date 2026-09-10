"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "bandirang-theme";

type Theme = "light" | "dark";

/*
 * <html> is the source of truth: the inline script in app/layout.tsx resolves
 * the stored theme onto it before paint, so the toggle subscribes to that class
 * instead of keeping its own copy. The server snapshot is light, which matches
 * the markup Next.js renders before the script runs.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const isDark = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      aria-pressed={isDark}
      onClick={() => {
        const next: Theme = isDark ? "light" : "dark";
        applyTheme(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // private mode: the theme just won't persist
        }
      }}
      className="text-muted-foreground"
    >
      <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} strokeWidth={2} />
    </Button>
  );
}
