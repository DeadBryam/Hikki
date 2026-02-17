import { rateLimit } from "elysia-rate-limit";

/**
 * Rate limiting plugin to prevent abuse
 * Applies default rate limiting rules to API endpoints
 */
export const genericRateLimit = rateLimit({
  duration: 60 * 1000,
  max: 15,
  headers: true,
});
