"use client";

import { createContext, use, type ReactNode } from "react";
import { createPortal } from "react-dom";

import type { Project } from "@/lib/domain/project";

interface ProjectContextValue {
  project: Project;
  actionsTarget: HTMLElement | null;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({
  project,
  actionsTarget,
  children,
}: ProjectContextValue & { children: ReactNode }) {
  return (
    <ProjectContext value={{ project, actionsTarget }}>
      {children}
    </ProjectContext>
  );
}

/** The current project's summary, kept fresh by the shell's query. */
export function useCurrentProject(): Project {
  const value = use(ProjectContext);
  if (!value) throw new Error("useCurrentProject needs a ProjectProvider");
  return value.project;
}

/** Renders step-specific controls (save state, next step) into the top bar. */
export function ShellActions({ children }: { children: ReactNode }) {
  const value = use(ProjectContext);
  if (!value?.actionsTarget) return null;
  return createPortal(children, value.actionsTarget);
}
