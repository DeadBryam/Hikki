/** biome-ignore-all lint/suspicious/useAwait: Plugins and middlewares are synchronous by design */
import { cors } from "@elysiajs/cors";
import { Logestic } from "logestic";

/**
 * CORS plugin configuration for handling cross-origin requests
 * Allows requests from frontend origins with credentials support
 */
export const corsPlugin: ReturnType<typeof cors> = cors({
  origin: ["http://localhost", "http://localhost:7500"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
  ],
  exposeHeaders: ["Set-Cookie"],
  maxAge: 86_400,
});

/**
 * Security headers plugin to enhance API security
 * Adds standard security headers to prevent common web vulnerabilities
 */
export const securityHeadersPlugin = (app: any) =>
  app.onAfterHandle(
    ({
      set,
      path,
    }: {
      set: { headers: Record<string, string | number> };
      path: string;
    }) => {
      set.headers["X-Content-Type-Options"] = "nosniff";

      set.headers["X-Frame-Options"] = "DENY";

      set.headers["X-XSS-Protection"] = "1; mode=block";

      if (process.env.NODE_ENV === "production") {
        set.headers["Strict-Transport-Security"] =
          "max-age=31536000; includeSubDomains";
      }

      set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

      if (path.startsWith("/docs")) {
        set.headers["Content-Security-Policy"] =
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://cdn.jsdelivr.net";
      } else {
        set.headers["Content-Security-Policy"] =
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'";
      }
    }
  );

/**
 * Security headers middleware function (legacy - use plugin instead)
 * Sets security headers on all responses
 */
export function securityHeadersMiddleware({
  set,
}: {
  set: { headers: Record<string, string | number> };
}) {
  set.headers["X-Content-Type-Options"] = "nosniff";

  set.headers["X-Frame-Options"] = "DENY";

  set.headers["X-XSS-Protection"] = "1; mode=block";

  if (process.env.NODE_ENV === "production") {
    set.headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains";
  }

  set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

  set.headers["Content-Security-Policy"] =
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'";

  return {};
}

/**
 * Logging plugin using Logestic with custom configuration
 * Provides structured logging with timestamps, duration, and IP information
 */
export const logesticPlugin = new Logestic({
  showLevel: true,
  httpLogging: true,
  explicitLogging: true,
})
  .use(["method", "path", "status", "duration", "ip", "time"])
  .format({
    onSuccess({ method, path, status, duration, ip, time }) {
      return `[${time}] ${method} ${path} - ${status} (${duration}ms) from ${ip}`;
    },
    onFailure({ error, code, datetime, request }) {
      return `[${datetime}] ${request.method} ${request.url} - ERROR ${code} - ${error.message}`;
    },
  });

export const serveConfig = {
  serve: {
    idleTimeout: 120,
    development: process.env.NODE_ENV !== "production",
  },
};
