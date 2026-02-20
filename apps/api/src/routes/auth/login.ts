import { t } from "elysia";
import { authService } from "@/config/dependencies";
import type { LoginParams } from "@/types/auth";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

export const loginHandler = async (
  context: AuthenticatedContext<LoginParams>
) => {
  const { body, set, ip, userAgent } = context;

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

  authService.setValidSessionCookie(context, result.token, result.cookieMaxAge);

  const user = authService.findUserByUsername(body.username);

  return createSuccessResponse({
    message: "Login successful",
    data: user,
  });
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
    200: createDataResponseSchema(
      t.Object({
        name: t.String({ description: "Display name of the user" }),
        email: t.String({ description: "Email of the user" }),
        username: t.String({ description: "Username of the user" }),
        onboarding_completed_at: t.Union(
          [
            t.String({
              description: "ISO timestamp when onboarding was completed",
            }),
            t.Null({ description: "Onboarding not completed" }),
          ],
          { description: "Onboarding completion timestamp" }
        ),
      })
    ),
    ...errorSchemas,
  },
};
