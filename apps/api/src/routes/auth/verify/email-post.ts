import { type Context, t } from "elysia";
import {
  userRepository,
  verificationTokenRepository,
} from "@/config/dependencies";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

interface VerifyEmailBody {
  token: string;
}

interface VerifyEmailPostContext extends Context {
  body: VerifyEmailBody;
}

export const verifyEmailPostHandler = ({
  body,
  set,
}: VerifyEmailPostContext) => {
  const { token } = body;

  const verificationToken = verificationTokenRepository.findByToken(token);

  if (!verificationToken) {
    set.status = 400;
    return createErrorResponse("Invalid or expired token", {
      code: "INVALID_TOKEN",
    });
  }

  if (verificationToken.type !== "email_verification") {
    set.status = 400;
    return createErrorResponse("Invalid token type", {
      code: "INVALID_TOKEN_TYPE",
    });
  }

  userRepository.setEmailVerified(verificationToken.user_id, true);
  verificationTokenRepository.delete(verificationToken.id);

  return createSuccessResponse({
    message: "Email verified successfully. You can now log in.",
  });
};

export const verifyEmailPostSchema = {
  body: t.Object({
    token: t.String({ description: "Verification token" }),
  }),
  detail: {
    summary: "Verify Email (POST)",
    description: "Verify user email with token (JSON response)",
    tags: ["Verification"],
  },
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
};
