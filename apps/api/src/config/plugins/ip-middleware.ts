import type { Context } from "elysia";

/**
 * Middleware to extract client IP address and User-Agent from request headers
 * Checks X-Forwarded-For, X-Real-IP headers for IP, and User-Agent header
 */
export const ipMiddleware = ({
  request,
}: Context): { ip: string; userAgent: string } => {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    .trim();
  const realIp = request.headers.get("x-real-ip")?.split(",")[0].trim();
  const ip = forwarded || realIp || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ip, userAgent };
};
