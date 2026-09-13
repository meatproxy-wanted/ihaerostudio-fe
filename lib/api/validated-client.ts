import { z } from "zod";

import { easyDocumentSchema, docImageSchema } from "@/lib/domain/document";
import { projectSchema } from "@/lib/domain/project";
import {
  publicationSchema,
  publicationSummarySchema,
  publicReadingSchema,
} from "@/lib/domain/publication";
import { reviewCompletionSchema, reviewRunSchema } from "@/lib/domain/review";
import { sourceDocumentSchema } from "@/lib/domain/source";
import { caseStructureSchema } from "@/lib/domain/structure";

import { ApiError } from "./errors";
import { imageCandidateSchema, type ApiClient } from "./types";

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError("aborted", "요청을 취소했어요.", { cause: error });
  }
  return new ApiError(
    "failed",
    "요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
    { cause: error },
  );
}

/**
 * Runs a request and checks its response against the domain schema, so a
 * server whose responses drift from our model fails here, not deep in a screen.
 */
async function parsed<T>(
  schema: z.ZodType<T>,
  request: () => Promise<unknown>,
): Promise<T> {
  let value: unknown;
  try {
    value = await request();
  } catch (error) {
    throw toApiError(error);
  }
  const result = schema.safeParse(value);
  if (!result.success) {
    console.error(
      "[api] response does not match the schema\n" +
        z.prettifyError(result.error),
    );
    throw new ApiError(
      "invalid-response",
      "서버 응답 형식이 달라요. 잠시 뒤 다시 시도해 주세요.",
      { cause: result.error },
    );
  }
  return result.data;
}

const withProject = <T extends z.ZodRawShape>(shape: T) =>
  z.object({ ...shape, project: projectSchema });

export function createValidatedClient(raw: ApiClient): ApiClient {
  return {
    projects: {
      list: () => parsed(z.array(projectSchema), () => raw.projects.list()),
      get: (projectId) =>
        parsed(projectSchema, () => raw.projects.get(projectId)),
      create: (input, options) =>
        parsed(projectSchema, () => raw.projects.create(input, options)),
      rename: (projectId, title) =>
        parsed(projectSchema, () => raw.projects.rename(projectId, title)),
      updateSettings: (projectId, settings) =>
        parsed(projectSchema, () =>
          raw.projects.updateSettings(projectId, settings),
        ),
      remove: (projectId) =>
        parsed(z.void(), () => raw.projects.remove(projectId)),
    },
    source: {
      get: (projectId) =>
        parsed(sourceDocumentSchema, () => raw.source.get(projectId)),
    },
    structure: {
      get: (projectId) =>
        parsed(caseStructureSchema, () => raw.structure.get(projectId)),
      save: (projectId, structure) =>
        parsed(withProject({ structure: caseStructureSchema }), () =>
          raw.structure.save(projectId, structure),
        ),
    },
    document: {
      generate: (projectId, options) =>
        parsed(withProject({ document: easyDocumentSchema }), () =>
          raw.document.generate(projectId, options),
        ),
      get: (projectId) =>
        parsed(easyDocumentSchema, () => raw.document.get(projectId)),
      save: (projectId, document) =>
        parsed(withProject({ document: easyDocumentSchema }), () =>
          raw.document.save(projectId, document),
        ),
    },
    assist: {
      simplify: (projectId, input, options) =>
        parsed(z.object({ suggestions: z.array(z.string()) }), () =>
          raw.assist.simplify(projectId, input, options),
        ),
      split: (projectId, input, options) =>
        parsed(z.object({ sentences: z.array(z.string()) }), () =>
          raw.assist.split(projectId, input, options),
        ),
      termCandidates: (projectId, input, options) =>
        parsed(z.object({ terms: z.array(z.string()) }), () =>
          raw.assist.termCandidates(projectId, input, options),
        ),
      explainTerm: (projectId, input, options) =>
        parsed(z.object({ explanation: z.string() }), () =>
          raw.assist.explainTerm(projectId, input, options),
        ),
      imageCandidates: (projectId, input, options) =>
        parsed(z.object({ candidates: z.array(imageCandidateSchema) }), () =>
          raw.assist.imageCandidates(projectId, input, options),
        ),
      uploadImage: (projectId, input, options) =>
        parsed(z.object({ image: docImageSchema }), () =>
          raw.assist.uploadImage(projectId, input, options),
        ),
    },
    review: {
      latest: (projectId) =>
        parsed(reviewRunSchema.nullable(), () => raw.review.latest(projectId)),
      run: (projectId, options) =>
        parsed(withProject({ run: reviewRunSchema }), () =>
          raw.review.run(projectId, options),
        ),
      dismiss: (projectId, input) =>
        parsed(withProject({ run: reviewRunSchema }), () =>
          raw.review.dismiss(projectId, input),
        ),
      restore: (projectId, input) =>
        parsed(withProject({ run: reviewRunSchema }), () =>
          raw.review.restore(projectId, input),
        ),
      complete: (projectId, input) =>
        parsed(withProject({ completion: reviewCompletionSchema }), () =>
          raw.review.complete(projectId, input),
        ),
    },
    publications: {
      list: (projectId) =>
        parsed(z.array(publicationSummarySchema), () =>
          raw.publications.list(projectId),
        ),
      get: (projectId, publicationId) =>
        parsed(publicationSchema, () =>
          raw.publications.get(projectId, publicationId),
        ),
      publish: (projectId) =>
        parsed(withProject({ publication: publicationSummarySchema }), () =>
          raw.publications.publish(projectId),
        ),
      setPublic: (projectId, publicationId) =>
        parsed(projectSchema, () =>
          raw.publications.setPublic(projectId, publicationId),
        ),
    },
    reader: {
      get: (projectId) =>
        parsed(publicReadingSchema, () => raw.reader.get(projectId)),
    },
    demo: {
      reset: () => parsed(z.void(), () => raw.demo.reset()),
      sampleText: () => parsed(z.string(), () => raw.demo.sampleText()),
    },
  };
}
