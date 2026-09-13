export const queryKeys = {
  projects: () => ["projects"] as const,
  project: (projectId: string) => ["projects", projectId] as const,
  source: (projectId: string) => ["projects", projectId, "source"] as const,
  structure: (projectId: string) =>
    ["projects", projectId, "structure"] as const,
  document: (projectId: string) => ["projects", projectId, "document"] as const,
  review: (projectId: string) => ["projects", projectId, "review"] as const,
  publications: (projectId: string) =>
    ["projects", projectId, "publications"] as const,
  publication: (projectId: string, publicationId: string) =>
    ["projects", projectId, "publications", publicationId] as const,
  reader: (projectId: string) => ["reader", projectId] as const,
};
