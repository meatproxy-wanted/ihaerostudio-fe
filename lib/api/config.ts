/**
 * Where the studio server is and how this producer is identified. Both come
 * from the build-time environment (see `.env.example`); the defaults match
 * the server's local development setup.
 *
 * The token stands in for a login: the server only uses it to tell producers
 * apart, and being a `NEXT_PUBLIC_` value it is visible to anyone who opens
 * the app. Production servers refuse the development token.
 */
export const STUDIO_SERVER = {
  baseUrl: (
    process.env.NEXT_PUBLIC_STUDIO_API_URL ?? "http://127.0.0.1:8100"
  ).replace(/\/+$/, ""),
  token: process.env.NEXT_PUBLIC_STUDIO_API_TOKEN ?? "dev-only-change-me",
} as const;
