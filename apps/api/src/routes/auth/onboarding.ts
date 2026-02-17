import { userRepository } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

export const completeOnboardingHandler = (
  context: AuthenticatedContext
): ApiResponse<Record<string, never>> | ErrorResponse => {
  const { user } = context;

  if (!user) {
    context.set.status = 401;
    return createErrorResponse("Unauthorized", { code: "UNAUTHORIZED" });
  }

  userRepository.completeOnboarding(user.id);

  return createSuccessResponse({});
};

export const completeOnboardingSchema = {
  detail: {
    summary: "Complete Onboarding",
    description: "Mark the user's onboarding as completed",
    tags: ["Authentication"],
  },
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
};
