"use client";

import { createContext, use } from "react";

import type { ReaderContext } from "@/lib/domain/reader-content";

export const EditorReaderContext = createContext<ReaderContext | null>(null);

/** Tone, picture setting, and case overview the editor renders with. */
export function useReaderContext(): ReaderContext {
  const context = use(EditorReaderContext);
  if (!context) throw new Error("useReaderContext needs its provider");
  return context;
}
