import { authService } from "@/config/dependencies";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse } from "@/utils/errors";

/**
 * Authentication middleware that validates session and returns 401 if invalid
 * Applied to protected routes using onBeforeHandle
 */
export const authMiddleware = (
  params: AuthenticatedContext
): undefined | Response => {
  const { cookie, set, userAgent } = params;
  const sessionToken = cookie.session?.value as string;

  if (!sessionToken) {
    set.status = 401;
    return new Response(
      JSON.stringify(
        createErrorResponse("No session present", { code: "NO_SESSION" })
      ),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const sessionData = authService.getSessionByToken(sessionToken, userAgent);
  if (!sessionData) {
    set.status = 401;
    return new Response(
      JSON.stringify(
        createErrorResponse("Invalid session", { code: "INVALID_SESSION" })
      ),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  authService.extendSession(sessionData.session.id);

  params.user = sessionData.user;
};
