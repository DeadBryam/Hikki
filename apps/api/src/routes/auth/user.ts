import { t } from "elysia";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { UserResponse } from "@/types/auth";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

export const userHandler = (
  context: AuthenticatedContext
): ApiResponse<UserResponse> | ErrorResponse => {
  const { user } = context;

  if (user === null || user === undefined) {
    context.set.status = 401;
    return createErrorResponse("Unauthorized: No user session found", {
      code: "NO_USER_SESSION",
    });
  }

  return createSuccessResponse({
    data: {
      username: user.username,
      email: user.email,
      name: user.name,
      onboarding_completed_at: user.onboarding_completed_at,
    },
  });
};

export const userSchema = {
  detail: {
    summary: "Get Current User",
    description: "Retrieve the current authenticated user's information",
    tags: ["Authentication"],
  },
  response: {
    200: createDataResponseSchema(
      t.Object({
        username: t.String({ description: "Username" }),
        email: t.String({ description: "Email address" }),
        name: t.String({ description: "Full name" }),
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
