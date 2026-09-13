"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getResumeStep } from "@/lib/domain/steps";
import { routes } from "@/lib/routes";

import { useCurrentProject } from "./project-context";

/** Sends /projects/[id] to the furthest step the producer has reached. */
export function ResumeRedirect() {
  const project = useCurrentProject();
  const router = useRouter();
  const target = routes.step(project.id, getResumeStep(project));

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return null;
}
