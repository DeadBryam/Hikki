import { t } from "elysia";
import { authService } from "@/config/dependencies";
import { env } from "@/config/env";
import type { LoginParams } from "@/types/auth";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

export const loginHandler = async (
  context: AuthenticatedContext<LoginParams>
) => {
  const { body, set, cookie, ip, userAgent } = context;

  const result = await authService.login({
    username: body.username,
    password: body.password,
    ip,
    userAgent,
  });

  if (!result.success) {
    set.status = result.statusCode;
    return createErrorResponse(result.message, { code: "LOGIN_FAILED" });
  }

  cookie.session.set({
    value: result.token,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: result.cookieMaxAge,
  });

  return createSuccessResponse({ message: "Login successful" });
};

export const loginSchema = {
  body: t.Object({
    username: t.String({
      description: "The username of the user",
      minLength: 3,
      maxLength: 50,
    }),
    password: t.String({
      description: "The password of the user",
      minLength: 8,
      maxLength: 128,
    }),
  }),
  detail: {
    summary: "User Login",
    description: "Authenticate a user with username and password",
    tags: ["Authentication"],
  },
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
};
