import { STUDIO_SERVER } from "./config";
import { createHttpApi } from "./http-client";
import { createValidatedClient } from "./validated-client";

/**
 * The single place the app picks its API implementation: the studio server
 * over HTTP, with every response checked against the domain schemas.
 */
export const api = createValidatedClient(createHttpApi(STUDIO_SERVER));
