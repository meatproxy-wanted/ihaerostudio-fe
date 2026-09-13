export type ApiErrorCode =
  "aborted" | "not-found" | "invalid-input" | "invalid-response" | "failed";

/** Every API failure reaches the UI as this, with a message fit to show. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiError";
    this.code = code;
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof ApiError && error.code === "aborted") ||
    (error instanceof DOMException && error.name === "AbortError")
  );
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "알 수 없는 문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.";
}
