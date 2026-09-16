/**
 * Where the studio server is and how this browser identifies itself. Both come
 * from the build-time environment (see `.env.example`); the address defaults
 * to the server's local development setup.
 *
 * A registered token names a fixed workspace on the server. Without one, the
 * client sends a visitor id it generated for this browser, which the server's
 * anonymous mode accepts as that browser's own workspace. Either way the value
 * is visible to whoever opens the app; it identifies, it does not authorize.
 */
export const STUDIO_SERVER = {
  baseUrl: (
    process.env.NEXT_PUBLIC_STUDIO_API_URL ?? "http://127.0.0.1:8100"
  ).replace(/\/+$/, ""),
  registeredToken: process.env.NEXT_PUBLIC_STUDIO_API_TOKEN || null,
} as const;
