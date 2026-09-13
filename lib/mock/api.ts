/*
 * MOCK ONLY — delete with the rest of lib/mock when the real server lands.
 *
 * An in-browser stand-in for the server behind the ApiClient interface. Every
 * analysis returns the fictional sample case; data persists in IndexedDB.
 */
import { ApiError } from "../api/errors";
import type { ApiClient, SourceInput } from "../api/types";
import type { Settings } from "../domain/common";
import type { DocImage, EasyDocument } from "../domain/document";
import type { Project } from "../domain/project";
import type { Publication } from "../domain/publication";
import {
  isSameReaderContent,
  toReaderContent,
  type ReaderContext,
} from "../domain/reader-content";
import type { ReviewRun } from "../domain/review";
import type { SourceDocument } from "../domain/source";
import type { CaseStructure } from "../domain/structure";
import { isSameStructureContent } from "../domain/structure-ops";
import { createSampleDraft } from "./fixtures/sample-draft";
import {
  SAMPLE_JUDGMENT_TEXT,
  SAMPLE_PARAGRAPHS,
} from "./fixtures/sample-source";
import { createSampleStructure } from "./fixtures/sample-structure";
import {
  explainTerm,
  imageCandidates,
  simplifySuggestions,
  splitSentences,
  termCandidates,
} from "./rules/assist";
import {
  defaultPartyName,
  personalizeDraft,
  personalizeStructure,
} from "./rules/personalize";
import {
  around,
  clone,
  delay,
  failIfRequested,
  newId,
  now,
  storage,
} from "./runtime";

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const TEXT_LIMITS = { min: 100, max: 100_000 };

const keys = {
  projects: "projects",
  source: (id: string) => `source:${id}`,
  structure: (id: string) => `structure:${id}`,
  document: (id: string) => `document:${id}`,
  review: (id: string) => `review:${id}`,
  publications: (id: string) => `publications:${id}`,
};

function notFound(what: string): never {
  throw new ApiError("not-found", `${what}을(를) 찾을 수 없어요.`);
}

async function readProjects() {
  return (await (await storage()).get<Project[]>(keys.projects)) ?? [];
}

async function requireProject(projectId: string) {
  const project = (await readProjects()).find((p) => p.id === projectId);
  return project ?? notFound("자료");
}

async function updateProject(
  projectId: string,
  update: (project: Project) => Project,
): Promise<Project> {
  const store = await storage();
  const projects = await readProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) notFound("자료");
  const next = { ...update(projects[index]), updatedAt: now() };
  projects[index] = next;
  await store.set(keys.projects, projects);
  return next;
}

async function requireRecord<T>(key: string, what: string): Promise<T> {
  const value = await (await storage()).get<T>(key);
  return value ?? notFound(what);
}

function readerContext(
  project: Project,
  structure: CaseStructure,
): ReaderContext {
  return {
    overview: structure.overview,
    tone: project.settings.tone,
    illustrations: project.settings.illustrations,
  };
}

function summarizeDocument(document: EasyDocument): Project["document"] {
  const sentences = document.sections.flatMap((section) =>
    section.cards.flatMap((card) => card.sentences),
  );
  return {
    saveRevision: document.saveRevision,
    contentRevision: document.contentRevision,
    basedOnStructureRevision: document.basedOnStructureRevision,
    basedOnSettingsRevision: document.basedOnSettingsRevision,
    sentenceCount: sentences.length,
    verifiedCount: sentences.filter((sentence) => sentence.verified).length,
  };
}

function validateSource(source: SourceInput) {
  if (source.kind === "pdf") {
    const isPdf =
      source.file.type === "application/pdf" ||
      source.file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      throw new ApiError("invalid-input", "PDF 파일만 올릴 수 있어요.");
    }
    if (source.file.size > MAX_PDF_BYTES) {
      throw new ApiError("invalid-input", "20MB 이하의 PDF만 올릴 수 있어요.");
    }
    return;
  }
  const length = source.text.trim().length;
  if (length < TEXT_LIMITS.min || length > TEXT_LIMITS.max) {
    throw new ApiError(
      "invalid-input",
      "판결문 텍스트는 100자 이상 10만 자 이하로 붙여 넣어 주세요.",
    );
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function notReady(): never {
  throw new ApiError("failed", "아직 준비 중인 기능이에요.");
}

export function createMockApi(): ApiClient {
  return {
    projects: {
      async list() {
        await delay(around(250));
        const projects = await readProjects();
        return [...projects].sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt),
        );
      },

      async get(projectId) {
        await delay(around(150));
        return requireProject(projectId);
      },

      async create(input, options) {
        validateSource(input.source);
        await delay(around(6000), options?.signal);
        failIfRequested(
          "analyze",
          "판결문을 분석하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
        );

        const store = await storage();
        const id = newId("p");
        const structure = personalizeStructure(
          createSampleStructure(id),
          input.settings,
        );
        const source: SourceDocument = {
          projectId: id,
          paragraphs: clone(SAMPLE_PARAGRAPHS),
        };
        const createdAt = now();
        const project: Project = {
          id,
          title: `${structure.overview.caseName} 사건 쉬운 설명자료`,
          createdAt,
          updatedAt: createdAt,
          settings: input.settings,
          settingsRevision: 0,
          source:
            input.source.kind === "pdf"
              ? {
                  kind: "pdf",
                  fileName: input.source.file.name,
                  byteSize: input.source.file.size,
                  charCount: SAMPLE_JUDGMENT_TEXT.length,
                }
              : {
                  kind: "text",
                  fileName: null,
                  byteSize: null,
                  charCount: input.source.text.trim().length,
                },
          caseNumber: structure.overview.caseNumber,
          structureRevision: structure.revision,
          document: null,
          review: {
            checkedContentRevision: null,
            openRequiredCount: null,
            completedContentRevision: null,
            completedAt: null,
          },
          publication: {
            latestVersion: null,
            latestContentRevision: null,
            publicPublicationId: null,
            publicVersion: null,
          },
        };

        await store.set(keys.source(id), source);
        await store.set(keys.structure(id), structure);
        await store.set(keys.projects, [project, ...(await readProjects())]);
        return project;
      },

      async rename(projectId, title) {
        await delay(around(250));
        failIfRequested("save", "제목을 저장하지 못했어요.");
        const trimmed = title.trim();
        if (!trimmed) {
          throw new ApiError("invalid-input", "제목을 입력해 주세요.");
        }
        return updateProject(projectId, (project) => ({
          ...project,
          title: trimmed,
        }));
      },

      async updateSettings(projectId, settings: Settings) {
        await delay(around(300));
        failIfRequested("save", "설정을 저장하지 못했어요.");
        const store = await storage();
        const current = await requireProject(projectId);
        const changed =
          JSON.stringify(current.settings) !== JSON.stringify(settings);
        if (!changed) return current;

        let structureRevision = current.structureRevision;
        if (current.settings.naming !== settings.naming) {
          // The naming setting seeds party names; changing it renames them.
          const structure = await requireRecord<CaseStructure>(
            keys.structure(projectId),
            "사건 구조",
          );
          const renamed: CaseStructure = {
            ...structure,
            revision: structure.revision + 1,
            parties: structure.parties.map((party) => ({
              ...party,
              displayName:
                defaultPartyName(party.id, settings.naming) ??
                party.displayName,
            })),
          };
          await store.set(keys.structure(projectId), renamed);
          structureRevision = renamed.revision;
        }

        return updateProject(projectId, (project) => ({
          ...project,
          settings,
          settingsRevision: project.settingsRevision + 1,
          structureRevision,
        }));
      },

      async remove(projectId) {
        await delay(around(300));
        const store = await storage();
        await requireProject(projectId);
        await Promise.all([
          store.del(keys.source(projectId)),
          store.del(keys.structure(projectId)),
          store.del(keys.document(projectId)),
          store.del(keys.review(projectId)),
          store.del(keys.publications(projectId)),
        ]);
        await store.set(
          keys.projects,
          (await readProjects()).filter((p) => p.id !== projectId),
        );
      },
    },

    source: {
      async get(projectId) {
        await delay(around(300));
        return requireRecord<SourceDocument>(keys.source(projectId), "원문");
      },
    },

    structure: {
      async get(projectId) {
        await delay(around(300));
        return requireRecord<CaseStructure>(
          keys.structure(projectId),
          "사건 구조",
        );
      },

      async save(projectId, structure) {
        failIfRequested("save", "사건 구조를 저장하지 못했어요.");
        await delay(around(300));
        const store = await storage();
        const previous = await requireRecord<CaseStructure>(
          keys.structure(projectId),
          "사건 구조",
        );
        const next: CaseStructure = {
          ...clone(structure),
          projectId,
          revision: isSameStructureContent(previous, structure)
            ? previous.revision
            : previous.revision + 1,
        };
        await store.set(keys.structure(projectId), next);
        const project = await updateProject(projectId, (current) => ({
          ...current,
          caseNumber: next.overview.caseNumber || null,
          structureRevision: next.revision,
        }));
        return { structure: next, project };
      },
    },

    document: {
      async generate(projectId, options) {
        await delay(around(7000), options?.signal);
        failIfRequested(
          "draft",
          "초안을 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.",
        );
        const store = await storage();
        const project = await requireProject(projectId);
        const structure = await requireRecord<CaseStructure>(
          keys.structure(projectId),
          "사건 구조",
        );
        const previous = await store.get<EasyDocument>(
          keys.document(projectId),
        );

        const draft = personalizeDraft(
          createSampleDraft(projectId, {
            structure: structure.revision,
            settings: project.settingsRevision,
          }),
          project.settings,
          structure,
        );
        if (previous) {
          draft.saveRevision = previous.saveRevision + 1;
          draft.contentRevision = previous.contentRevision + 1;
        }

        await store.set(keys.document(projectId), draft);
        const updated = await updateProject(projectId, (current) => ({
          ...current,
          document: summarizeDocument(draft),
        }));
        return { document: draft, project: updated };
      },

      async get(projectId) {
        await delay(around(300));
        return requireRecord<EasyDocument>(keys.document(projectId), "초안");
      },

      async save(projectId, document) {
        failIfRequested("save", "변경 내용을 저장하지 못했어요.");
        await delay(around(300));
        const store = await storage();
        const project = await requireProject(projectId);
        const structure = await requireRecord<CaseStructure>(
          keys.structure(projectId),
          "사건 구조",
        );
        const previous = await requireRecord<EasyDocument>(
          keys.document(projectId),
          "초안",
        );
        const contentChanged = !isSameReaderContent(
          previous,
          document,
          readerContext(project, structure),
        );
        const next: EasyDocument = {
          ...clone(document),
          projectId,
          saveRevision: previous.saveRevision + 1,
          contentRevision: previous.contentRevision + (contentChanged ? 1 : 0),
          basedOnStructureRevision: previous.basedOnStructureRevision,
          basedOnSettingsRevision: previous.basedOnSettingsRevision,
        };
        await store.set(keys.document(projectId), next);
        const updated = await updateProject(projectId, (current) => ({
          ...current,
          document: summarizeDocument(next),
        }));
        return { document: next, project: updated };
      },
    },

    assist: {
      async simplify(_projectId, input, options) {
        await delay(around(1100), options?.signal);
        failIfRequested(
          "assist",
          "수정안을 받지 못했어요. 다시 시도해 주세요.",
        );
        return { suggestions: simplifySuggestions(input.text) };
      },

      async split(_projectId, input, options) {
        await delay(around(1000), options?.signal);
        failIfRequested(
          "assist",
          "문장을 나누지 못했어요. 다시 시도해 주세요.",
        );
        return { sentences: splitSentences(input.text) };
      },

      async termCandidates(_projectId, input, options) {
        await delay(around(700), options?.signal);
        failIfRequested("assist", "용어 후보를 받지 못했어요.");
        return { terms: termCandidates(input.text) };
      },

      async explainTerm(_projectId, input, options) {
        await delay(around(900), options?.signal);
        failIfRequested("assist", "설명 초안을 받지 못했어요.");
        return { explanation: explainTerm(input.term) };
      },

      async imageCandidates(projectId, input, options) {
        await delay(around(900), options?.signal);
        failIfRequested("assist", "그림 후보를 받지 못했어요.");
        const document = await requireRecord<EasyDocument>(
          keys.document(projectId),
          "초안",
        );
        const card = document.sections
          .flatMap((section) => section.cards)
          .find((candidate) => candidate.id === input.cardId);
        if (!card) notFound("카드");
        const current = document.images.find(
          (image) => image.id === card.imageId,
        );
        return { candidates: imageCandidates(card, current?.src ?? null) };
      },

      async uploadImage(_projectId, input, options) {
        const allowed = ["image/png", "image/jpeg", "image/svg+xml"];
        if (!allowed.includes(input.file.type)) {
          throw new ApiError(
            "invalid-input",
            "PNG, JPG, SVG 그림만 올릴 수 있어요.",
          );
        }
        if (input.file.size > MAX_IMAGE_BYTES) {
          throw new ApiError(
            "invalid-input",
            "2MB 이하의 그림만 올릴 수 있어요.",
          );
        }
        await delay(around(800), options?.signal);
        failIfRequested("assist", "그림을 올리지 못했어요.");
        const image: DocImage = {
          id: newId("img"),
          src: await blobToDataUrl(input.file),
          alt: input.alt,
          meaning: input.meaning,
          source: "upload",
        };
        return { image };
      },
    },

    review: {
      async latest(projectId) {
        await delay(around(250));
        return (
          (await (await storage()).get<ReviewRun>(keys.review(projectId))) ??
          null
        );
      },
      run: notReady,
      dismiss: notReady,
      restore: notReady,
      complete: notReady,
    },

    publications: {
      async list(projectId) {
        await delay(around(250));
        const publications =
          (await (
            await storage()
          ).get<Publication[]>(keys.publications(projectId))) ?? [];
        return publications
          .map(({ content: _content, ...summary }) => summary)
          .reverse();
      },

      async get(projectId, publicationId) {
        await delay(around(250));
        const publications =
          (await (
            await storage()
          ).get<Publication[]>(keys.publications(projectId))) ?? [];
        return (
          publications.find((p) => p.id === publicationId) ?? notFound("게시본")
        );
      },

      async publish(projectId) {
        failIfRequested("publish", "게시본을 만들지 못했어요.");
        await delay(around(600));
        const store = await storage();
        const project = await requireProject(projectId);
        const structure = await requireRecord<CaseStructure>(
          keys.structure(projectId),
          "사건 구조",
        );
        const document = await requireRecord<EasyDocument>(
          keys.document(projectId),
          "초안",
        );
        const publications =
          (await store.get<Publication[]>(keys.publications(projectId))) ?? [];
        const reviewed =
          project.review.completedContentRevision === document.contentRevision;

        let publication = publications.at(-1);
        if (publication?.contentRevision === document.contentRevision) {
          // Same content: reuse the snapshot, but record a review done since.
          publication.reviewed ||= reviewed;
        } else {
          publication = {
            id: newId("pub"),
            projectId,
            version: (publication?.version ?? 0) + 1,
            createdAt: now(),
            contentRevision: document.contentRevision,
            reviewed,
            content: toReaderContent(
              document,
              readerContext(project, structure),
            ),
          };
          publications.push(publication);
        }
        await store.set(keys.publications(projectId), publications);

        const { content: _content, ...summary } = publication;
        const updated = await updateProject(projectId, (current) => ({
          ...current,
          publication: {
            ...current.publication,
            latestVersion: summary.version,
            latestContentRevision: summary.contentRevision,
          },
        }));
        return { publication: summary, project: updated };
      },

      async setPublic(projectId, publicationId) {
        failIfRequested("publish", "공개 설정을 바꾸지 못했어요.");
        await delay(around(400));
        let version: number | null = null;
        if (publicationId) {
          const publications =
            (await (
              await storage()
            ).get<Publication[]>(keys.publications(projectId))) ?? [];
          const publication =
            publications.find((p) => p.id === publicationId) ??
            notFound("게시본");
          if (!publication.reviewed) {
            throw new ApiError(
              "invalid-input",
              "검토를 마친 게시본만 공개할 수 있어요.",
            );
          }
          version = publication.version;
        }
        return updateProject(projectId, (project) => ({
          ...project,
          publication: {
            ...project.publication,
            publicPublicationId: publicationId,
            publicVersion: version,
          },
        }));
      },
    },

    reader: {
      async get(projectId) {
        await delay(around(300));
        const store = await storage();
        const project = (await readProjects()).find((p) => p.id === projectId);
        const publicId = project?.publication.publicPublicationId;
        if (!publicId) return { status: "unavailable" };
        const publications =
          (await store.get<Publication[]>(keys.publications(projectId))) ?? [];
        const publication = publications.find((p) => p.id === publicId);
        return publication
          ? { status: "available", publication }
          : { status: "unavailable" };
      },
    },

    demo: {
      async reset() {
        await delay(around(300));
        await (await storage()).clear();
      },
      async sampleText() {
        return SAMPLE_JUDGMENT_TEXT;
      },
    },
  };
}
