import { authService } from "@/config/dependencies";
import { env } from "@/config/env";
import type { ExtendedContext } from "@/types/context";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

export const logoutHandler = async (context: ExtendedContext) => {
  const { cookie } = context;

  await authService.invalidateSession(cookie.session.value as string);

  cookie.session.set({
    value: "",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });

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
