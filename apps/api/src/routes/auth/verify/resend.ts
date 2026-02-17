import { t } from "elysia";
import {
  emailService,
  userRepository,
  verificationTokenRepository,
} from "@/config/dependencies";
import type { ExtendedContext } from "@/types/context";
import { createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

interface ResendVerificationBody {
  email: string;
}

export const resendVerificationHandler = async ({
  body,
}: ExtendedContext<ResendVerificationBody>) => {
  const { email } = body;

  const user = userRepository.findByEmail(email);

  if (user === null || user === undefined) {
    return createSuccessResponse({
      message: "If the email exists, you will receive a new verification link.",
    });
  }

  if (user.validated_at) {
    return createSuccessResponse({
      message: "This email is already verified.",
    });
  }

  verificationTokenRepository.deleteByUserId(user.id, "email_verification");

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  verificationTokenRepository.create({
    id: crypto.randomUUID(),
    user_id: user.id,
    token,
    type: "email_verification",
    expires_at: expiresAt,
  });

  await emailService.sendVerificationEmail(email, token);

  return createSuccessResponse({
    message: "If the email exists, you will receive a new verification link.",
  });
};

export const resendVerificationSchema = {
  body: t.Object({
    email: t.String({
      format: "email",
      description: "Email address to resend verification",
    }),
  }),
  detail: {
    summary: "Resend Verification Email",
    description: "Resend email verification link to the user",
    tags: ["Verification"],
  },
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
};
