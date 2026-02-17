import { createHash } from "node:crypto";

/**
 * Generates an ETag for the given data
 * Uses SHA-256 hash of the JSON stringified data
 */
export function generateETag(data: unknown): string {
  const jsonString = JSON.stringify(data, Object.keys(data || {}).sort());
  const hash = createHash("sha256").update(jsonString).digest("hex");
  return `"${hash.slice(0, 16)}"`;
}

/**
 * Checks if the request contains an If-None-Match header that matches the ETag
 * Returns true if the content has not changed (304 Not Modified should be returned)
 */
export function isNotModified(request: Request, etag: string): boolean {
  const ifNoneMatch = request.headers.get("If-None-Match");
  return ifNoneMatch === etag || ifNoneMatch === "*";
}

/**
 * Sets cache control headers for GET responses
 * @param set - Elysia set object
 * @param maxAge - Cache duration in seconds (default: 300 = 5 minutes)
 * @param isPrivate - Whether the cache is private to the user (default: true)
 */
export function setCacheHeaders(
  set: { headers: Record<string, string | number> },
  maxAge = 300,
  isPrivate = true
): void {
  set.headers["Cache-Control"] =
    `${isPrivate ? "private" : "public"}, max-age=${maxAge}`;
}

/**
 * Sets ETag and cache headers for a response
 * @param set - Elysia set object
 * @param data - The response data to generate ETag from
 * @param maxAge - Cache duration in seconds (default: 300 = 5 minutes)
 */
export function setETagAndCacheHeaders(
  set: { headers: Record<string, string | number> },
  data: unknown,
  maxAge = 300
): void {
  const etag = generateETag(data);
  set.headers.ETag = etag;
  setCacheHeaders(set, maxAge);
}
