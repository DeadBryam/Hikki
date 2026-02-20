import { authService } from "@/config/dependencies";
import type { AuthenticatedContext } from "@/types/context";

/**
 * Authentication middleware that validates session and returns 401 if invalid
 * Applied to protected routes using onBeforeHandle
 */
export const authMiddleware = (params: AuthenticatedContext): undefined => {
  const { cookie, set, userAgent } = params;
  const sessionToken = cookie.session?.value as string;

  if (!sessionToken) {
    authService.setClearSessionCookie(params);
    set.status = 401;
    throw new Error(
      JSON.stringify({ error: "No session present", code: "NO_SESSION" })
    );
  }

  const sessionData = authService.getSessionByToken(sessionToken, userAgent);
  if (!sessionData) {
    authService.setClearSessionCookie(params);
    set.status = 401;
    throw new Error(
      JSON.stringify({
        error: "Invalid session",
        code: "INVALID_SESSION",
      })
    );
  }

  authService.extendSession(sessionData.session.id);

  params.user = sessionData.user;
};
