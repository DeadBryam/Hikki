import { swagger } from "@elysiajs/swagger";

/**
 * Swagger/OpenAPI documentation plugin
 * Generates interactive API documentation with endpoint details and schemas
 */
export const swaggerPlugin = swagger({
  documentation: {
    info: {
      title: "Hikki AI Assistant API",
      version: "1.0.0",
      description: `
# Hikki AI Assistant API

A comprehensive API for AI-powered chat conversations with advanced features like rate limiting, caching, and bulk operations.

## Authentication

All API endpoints (except signup and login) require authentication via session cookie. The login endpoint sets an HTTP-only session cookie that is automatically sent with subsequent requests.

Session tokens are opaque and have a sliding window expiration (7 days, max 15 days absolute).

For manual testing or tools that don't handle cookies automatically, include the session token in the \`Cookie\` header:

\`\`\`
Cookie: session=<your-session-token>
\`\`\`

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Generic endpoints**: 15 requests per minute
- **Authentication endpoints**: 5 requests per minute
- **Write operations**: 20 requests per minute
- **Read operations**: 60 requests per minute

Rate limit headers are included in all responses:
- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Remaining requests in current window
- \`X-RateLimit-Reset\`: Time when the limit resets

## Response Format

All responses follow a consistent format:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

## Error Handling

Errors include detailed validation messages:

\`\`\`json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Must be a valid email address" }
  ],
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

## Caching

GET endpoints support HTTP caching with ETags. Include \`If-None-Match\` header to check for updates.
      `,
      contact: {
        name: "API Support",
        email: "support@hikki.ai",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    tags: [
      { name: "App", description: "General application endpoints" },
      { name: "Chat", description: "AI chat and conversation endpoints" },
      {
        name: "Authentication",
        description: "User authentication and account management",
      },
      { name: "Verification", description: "Email verification endpoints" },
      {
        name: "Password Reset",
        description: "Password reset and recovery endpoints",
      },
      { name: "Threads", description: "Thread and conversation management" },
      { name: "Admin", description: "Administrative and monitoring endpoints" },
    ],
    servers: [
      {
        url: "http://localhost:7300",
        description: "Development server",
      },
      {
        url: "https://api.hikki.ai",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "session",
          description: "Session token obtained from login endpoint",
        },
      },
    },
    security: [
      {
        sessionAuth: [],
      },
    ],
  },
  path: "/docs",
  exclude: ["/docs", "/docs/json"],
});
