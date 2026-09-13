import type { StepKey } from "@/lib/domain/steps";

export type ProjectStep = Exclude<StepKey, "upload">;

export interface EditorLink {
  sentence?: string;
  card?: string;
  tool?: string;
  /** Show a "back to review" link in the editor. */
  fromReview?: boolean;
}

function withQuery(path: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, value);
  }
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export const routes = {
  home: () => "/",
  newProject: (options?: { sample?: boolean }) =>
    options?.sample ? "/new?sample=1" : "/new",
  project: (projectId: string) => `/projects/${projectId}`,
  step: (projectId: string, step: ProjectStep) =>
    `/projects/${projectId}/${step}`,
  editor: (projectId: string, link: EditorLink = {}) =>
    withQuery(`/projects/${projectId}/edit`, {
      sentence: link.sentence,
      card: link.card,
      tool: link.tool,
      from: link.fromReview ? "review" : undefined,
    }),
  read: (projectId: string) => `/read/${projectId}`,
  print: (projectId: string, publicationId: string) =>
    withQuery(`/print/${projectId}`, { publication: publicationId }),
};
