import { authService } from "@/config/dependencies";
import type { ExtendedContext } from "@/types/context";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

export const logoutHandler = async (context: ExtendedContext) => {
  const { cookie } = context;

  await authService.invalidateSession(cookie.session.value as string);
  authService.setClearSessionCookie(context);

  return {
    success: true,
    message: "Logout successful",
    timestamp: new Date().toISOString(),
  };
};

export const logoutSchema = {
  detail: {
    summary: "User Logout",
    description: "Invalidate the current user session",
    tags: ["Authentication"],
  },
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
};
