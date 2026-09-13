import { z } from "zod";

import type { Settings } from "@/lib/domain/common";
import type { DocImage, EasyDocument } from "@/lib/domain/document";
import type { Project } from "@/lib/domain/project";
import type {
  Publication,
  PublicationSummary,
  PublicReading,
} from "@/lib/domain/publication";
import type {
  ChecklistKey,
  ReviewCompletion,
  ReviewRun,
} from "@/lib/domain/review";
import type { SourceDocument } from "@/lib/domain/source";
import type { CaseStructure } from "@/lib/domain/structure";

export interface RequestOptions {
  signal?: AbortSignal;
}

export type SourceInput =
  { kind: "pdf"; file: File } | { kind: "text"; text: string };

export interface CreateProjectInput {
  source: SourceInput;
  settings: Settings;
}

export const imageCandidateSchema = z.object({
  src: z.string().min(1),
  alt: z.string(),
  meaning: z.string(),
});
export type ImageCandidate = z.infer<typeof imageCandidateSchema>;

/**
 * Everything the screens need from the server, grouped by feature. This is
 * not an endpoint list: names and shapes will be aligned with the real server
 * when it exists. Screens depend on this interface only.
 */
export interface ApiClient {
  projects: {
    list(): Promise<Project[]>;
    get(projectId: string): Promise<Project>;
    /** Uploads the judgment and analyzes it; the project exists only afterwards. */
    create(
      input: CreateProjectInput,
      options?: RequestOptions,
    ): Promise<Project>;
    rename(projectId: string, title: string): Promise<Project>;
    updateSettings(projectId: string, settings: Settings): Promise<Project>;
    remove(projectId: string): Promise<void>;
  };
  source: {
    get(projectId: string): Promise<SourceDocument>;
  };
  structure: {
    get(projectId: string): Promise<CaseStructure>;
    save(
      projectId: string,
      structure: CaseStructure,
    ): Promise<{ structure: CaseStructure; project: Project }>;
  };
  document: {
    /** Creates the draft, replacing an existing document. */
    generate(
      projectId: string,
      options?: RequestOptions,
    ): Promise<{ document: EasyDocument; project: Project }>;
    get(projectId: string): Promise<EasyDocument>;
    save(
      projectId: string,
      document: EasyDocument,
    ): Promise<{ document: EasyDocument; project: Project }>;
  };
  assist: {
    simplify(
      projectId: string,
      input: { sentenceId: string; text: string },
      options?: RequestOptions,
    ): Promise<{ suggestions: string[] }>;
    split(
      projectId: string,
      input: { sentenceId: string; text: string },
      options?: RequestOptions,
    ): Promise<{ sentences: string[] }>;
    termCandidates(
      projectId: string,
      input: { text: string },
      options?: RequestOptions,
    ): Promise<{ terms: string[] }>;
    explainTerm(
      projectId: string,
      input: { term: string; context: string },
      options?: RequestOptions,
    ): Promise<{ explanation: string }>;
    imageCandidates(
      projectId: string,
      input: { cardId: string },
      options?: RequestOptions,
    ): Promise<{ candidates: ImageCandidate[] }>;
    uploadImage(
      projectId: string,
      input: { file: File; alt: string; meaning: string },
      options?: RequestOptions,
    ): Promise<{ image: DocImage }>;
  };
  review: {
    latest(projectId: string): Promise<ReviewRun | null>;
    run(
      projectId: string,
      options?: RequestOptions,
    ): Promise<{ run: ReviewRun; project: Project }>;
    dismiss(
      projectId: string,
      input: { key: string; memo: string },
    ): Promise<{ run: ReviewRun; project: Project }>;
    restore(
      projectId: string,
      input: { key: string },
    ): Promise<{ run: ReviewRun; project: Project }>;
    complete(
      projectId: string,
      input: { checklist: ChecklistKey[] },
    ): Promise<{ completion: ReviewCompletion; project: Project }>;
  };
  publications: {
    list(projectId: string): Promise<PublicationSummary[]>;
    get(projectId: string, publicationId: string): Promise<Publication>;
    /** Snapshots the current content, reusing the latest one if unchanged. */
    publish(
      projectId: string,
    ): Promise<{ publication: PublicationSummary; project: Project }>;
    setPublic(
      projectId: string,
      publicationId: string | null,
    ): Promise<Project>;
  };
  reader: {
    get(projectId: string): Promise<PublicReading>;
  };
  demo: {
    reset(): Promise<void>;
    sampleText(): Promise<string>;
  };
}
