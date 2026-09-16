import { STUDIO_SERVER } from "./config";
import { createHttpApi } from "./http-client";
import { createValidatedClient } from "./validated-client";
import { visitorToken } from "./visitor";

/**
 * The single place the app picks its API implementation: the studio server
 * over HTTP, with every response checked against the domain schemas.
 */
export const api = createValidatedClient(
  createHttpApi({
    baseUrl: STUDIO_SERVER.baseUrl,
    token: () => STUDIO_SERVER.registeredToken ?? visitorToken(),
  }),
);
