import { ApiError, type ApiErrorCode } from "./errors";
import type { ApiClient } from "./types";

export interface HttpApiOptions {
  /** The server's origin, e.g. `http://127.0.0.1:8100`. Paths are added here. */
  baseUrl: string;
  /** The producer's bearer token; the server tells producers apart by it. */
  token: string;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestInput {
  method?: Method;
  /** JSON-encoded unless it is a `FormData` (file uploads). */
  body?: unknown;
  signal?: AbortSignal;
  /** Public endpoints (reader, health) are called without the token. */
  auth?: boolean;
}

const STUDIO = "/api/studio";

const MESSAGES = {
  unreachable: "서버에 연결하지 못했어요. 서버가 실행 중인지 확인해 주세요.",
  unauthorized: "서버가 API 토큰을 받아들이지 않았어요. 설정을 확인해 주세요.",
  invalidInput: "입력 내용을 확인해 주세요.",
  failed: "서버 요청에 실패했어요. 잠시 뒤 다시 시도해 주세요.",
} as const;

function codeFor(status: number): ApiErrorCode {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404) return "not-found";
  if (status === 409) return "conflict";
  if (status === 400 || status === 413 || status === 422) {
    return "invalid-input";
  }
  return "failed";
}

/**
 * The server explains failures as `{ detail: { code, message } }` with a
 * message written for the producer. Framework validation errors carry a list
 * in `detail` instead, which has nothing worth showing.
 */
function serverMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const { detail } = payload as { detail?: unknown };
  if (typeof detail !== "object" || detail === null) return null;
  const { message } = detail as { message?: unknown };
  return typeof message === "string" && message ? message : null;
}

async function toApiError(response: Response): Promise<ApiError> {
  const code = codeFor(response.status);
  if (response.status === 401) {
    return new ApiError("unauthorized", MESSAGES.unauthorized);
  }
  const payload: unknown = await response.json().catch(() => null);
  const fallback =
    code === "invalid-input" ? MESSAGES.invalidInput : MESSAGES.failed;
  return new ApiError(code, serverMessage(payload) ?? fallback);
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * The `ApiClient` over the studio server's HTTP API. Responses come back as
 * parsed JSON; the validated client checks them against the domain schemas.
 * Failures become `ApiError`s carrying the server's own message when it has
 * one, and cancellation passes through as an abort.
 */
export function createHttpApi({ baseUrl, token }: HttpApiOptions): ApiClient {
  const origin = baseUrl.replace(/\/+$/, "");

  async function request<T>(
    path: string,
    { method = "GET", body, signal, auth = true }: RequestInput = {},
  ): Promise<T> {
    const multipart = body instanceof FormData;
    const headers: Record<string, string> = {};
    if (auth) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined && !multipart) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;
    try {
      response = await fetch(`${origin}${path}`, {
        method,
        headers,
        body:
          body === undefined
            ? undefined
            : multipart
              ? body
              : JSON.stringify(body),
        signal,
        cache: "no-store",
      });
    } catch (error) {
      if (isAbort(error)) throw error;
      throw new ApiError("failed", MESSAGES.unreachable, { cause: error });
    }

    if (!response.ok) throw await toApiError(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  const send = <T>(
    path: string,
    method: Method,
    body?: unknown,
    signal?: AbortSignal,
  ) => request<T>(path, { method, body, signal });

  const project = (projectId: string) =>
    `${STUDIO}/projects/${encodeURIComponent(projectId)}`;

  const assist = <T>(
    projectId: string,
    action: string,
    body: unknown,
    signal?: AbortSignal,
  ) => send<T>(`${project(projectId)}/assist/${action}`, "POST", body, signal);

  return {
    projects: {
      list: () => request(`${STUDIO}/projects`),
      get: (projectId) => request(project(projectId)),
      create: (input, options) => {
        if (input.source.kind === "text") {
          return send(
            `${STUDIO}/projects/text`,
            "POST",
            { text: input.source.text, settings: input.settings },
            options?.signal,
          );
        }
        const form = new FormData();
        form.set("file", input.source.file);
        form.set("settings", JSON.stringify(input.settings));
        return send(`${STUDIO}/projects/pdf`, "POST", form, options?.signal);
      },
      rename: (projectId, title) =>
        send(`${project(projectId)}/title`, "PATCH", { title }),
      updateSettings: (projectId, settings) =>
        send(`${project(projectId)}/settings`, "PUT", settings),
      remove: (projectId) => send(project(projectId), "DELETE"),
    },

    source: {
      get: (projectId) => request(`${project(projectId)}/source`),
    },

    structure: {
      get: (projectId) => request(`${project(projectId)}/structure`),
      save: (projectId, structure) =>
        send(`${project(projectId)}/structure`, "PUT", structure),
    },

    document: {
      generate: (projectId, options) =>
        send(
          `${project(projectId)}/document/generate`,
          "POST",
          undefined,
          options?.signal,
        ),
      get: (projectId) => request(`${project(projectId)}/document`),
      save: (projectId, document) =>
        send(`${project(projectId)}/document`, "PUT", document),
    },

    assist: {
      simplify: (projectId, input, options) =>
        assist(projectId, "simplify", input, options?.signal),
      split: (projectId, input, options) =>
        assist(projectId, "split", input, options?.signal),
      termCandidates: (projectId, input, options) =>
        assist(projectId, "terms", input, options?.signal),
      explainTerm: (projectId, input, options) =>
        assist(projectId, "explain", input, options?.signal),
      imageCandidates: (projectId, input, options) =>
        assist(projectId, "images", input, options?.signal),
      uploadImage: (projectId, input, options) => {
        const form = new FormData();
        form.set("file", input.file);
        form.set("alt", input.alt);
        form.set("meaning", input.meaning);
        return assist(projectId, "upload-image", form, options?.signal);
      },
    },

    review: {
      latest: (projectId) => request(`${project(projectId)}/review`),
      run: (projectId, options) =>
        send(
          `${project(projectId)}/review/run`,
          "POST",
          undefined,
          options?.signal,
        ),
      dismiss: (projectId, input) =>
        send(`${project(projectId)}/review/dismiss`, "POST", input),
      restore: (projectId, input) =>
        send(`${project(projectId)}/review/restore`, "POST", input),
      complete: (projectId, input) =>
        send(`${project(projectId)}/review/complete`, "POST", input),
    },

    publications: {
      list: (projectId) => request(`${project(projectId)}/publications`),
      get: (projectId, publicationId) =>
        request(
          `${project(projectId)}/publications/${encodeURIComponent(publicationId)}`,
        ),
      publish: (projectId) =>
        send(`${project(projectId)}/publications`, "POST"),
      setPublic: (projectId, publicationId) =>
        send(`${project(projectId)}/public`, "PUT", { publicationId }),
    },

    reader: {
      get: (projectId) =>
        request(`${STUDIO}/reader/${encodeURIComponent(projectId)}`, {
          auth: false,
        }),
    },

    demo: {
      reset: () => send(`${STUDIO}/demo/reset`, "POST"),
    },

    server: {
      health: async () => {
        // The probe lives outside `/api/studio` and answers in snake_case.
        const raw = await request<Record<string, unknown> | null>("/health", {
          auth: false,
        });
        return {
          status: raw?.status,
          aiProvider: raw?.ai_provider,
          environment: raw?.environment,
        } as Awaited<ReturnType<ApiClient["server"]["health"]>>;
      },
    },
  };
}
