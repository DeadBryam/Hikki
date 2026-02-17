import { randomUUID } from "node:crypto";

/**
 * Request ID middleware that generates a unique ID for each request
 * and makes it available in the request context for logging and tracing
 */
export const requestIdMiddleware = (app: any) =>
  app.derive(({ request }: { request: Request }) => {
    const requestId = request.headers.get("x-request-id") || randomUUID();
    return { requestId };
  });
