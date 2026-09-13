import { createMockApi } from "@/lib/mock/api";

import { createValidatedClient } from "./validated-client";

/**
 * The single place the app picks its API implementation. Swap the mock for an
 * HTTP client with the same interface once the server exists.
 */
export const api = createValidatedClient(createMockApi());
