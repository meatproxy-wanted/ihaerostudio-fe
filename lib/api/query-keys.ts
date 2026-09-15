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
  serverHealth: () => ["server", "health"] as const,
  /** AI help is keyed by its input, so an edited sentence asks again. */
  assist: {
    simplify: (projectId: string, sentenceId: string, text: string) =>
      ["assist", "simplify", projectId, sentenceId, text] as const,
    split: (projectId: string, sentenceId: string, text: string) =>
      ["assist", "split", projectId, sentenceId, text] as const,
    terms: (projectId: string, text: string) =>
      ["assist", "terms", projectId, text] as const,
    explain: (projectId: string, term: string) =>
      ["assist", "explain", projectId, term] as const,
    images: (projectId: string, cardId: string) =>
      ["assist", "images", projectId, cardId] as const,
  },
};
