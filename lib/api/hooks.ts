"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import type { Project } from "@/lib/domain/project";

import { api } from "./client";
import { queryKeys } from "./query-keys";

/** Writes a fresh project summary everywhere it is cached. */
export function cacheProject(queryClient: QueryClient, project: Project) {
  queryClient.setQueryData(queryKeys.project(project.id), project);
  queryClient.setQueryData<Project[]>(queryKeys.projects(), (projects) => {
    if (!projects) return projects;
    const rest = projects.filter((item) => item.id !== project.id);
    return [project, ...rest].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  });
}

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects(),
    queryFn: () => api.projects.list(),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => api.projects.get(projectId),
  });
}

export function useRemoveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => api.projects.remove(projectId),
    onSuccess: (_result, projectId) => {
      queryClient.setQueryData<Project[]>(queryKeys.projects(), (projects) =>
        projects?.filter((project) => project.id !== projectId),
      );
      queryClient.removeQueries({ queryKey: queryKeys.project(projectId) });
    },
  });
}

export function useResetDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.demo.reset(),
    onSuccess: async () => {
      queryClient.removeQueries();
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
    },
  });
}

export function useSource(projectId: string) {
  return useQuery({
    queryKey: queryKeys.source(projectId),
    queryFn: () => api.source.get(projectId),
    staleTime: Infinity,
  });
}

export function useStructureQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.structure(projectId),
    queryFn: () => api.structure.get(projectId),
    staleTime: Infinity,
  });
}

export function useDocumentQuery(projectId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.document(projectId),
    queryFn: () => api.document.get(projectId),
    staleTime: Infinity,
    enabled,
  });
}
