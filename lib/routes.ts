import type { StepKey } from "@/lib/domain/steps";

export type ProjectStep = Exclude<StepKey, "upload">;

/** Editor tools a link can open, in the order the tool panel lists them. */
export const EDITOR_TOOLS = ["simplify", "split", "term", "image"] as const;
export type EditorTool = (typeof EDITOR_TOOLS)[number];

export function parseEditorTool(value: string | null): EditorTool | null {
  return EDITOR_TOOLS.find((tool) => tool === value) ?? null;
}

export interface EditorLink {
  sentence?: string;
  card?: string;
  tool?: EditorTool;
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
  review: (projectId: string, options: { item?: string } = {}) =>
    withQuery(`/projects/${projectId}/review`, { item: options.item }),
  read: (projectId: string) => `/read/${projectId}`,
  print: (projectId: string, publicationId: string) =>
    withQuery(`/print/${projectId}`, { publication: publicationId }),
};
