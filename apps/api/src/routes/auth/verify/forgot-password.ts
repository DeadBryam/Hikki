import type { Context } from "elysia";
import { t } from "elysia";
import {
  emailService,
  userRepository,
  verificationTokenRepository,
} from "@/config/dependencies";
import { createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

interface ForgotPasswordBody {
  email: string;
}

interface ForgotPasswordContext extends Context {
  body: ForgotPasswordBody;
}

export const forgotPasswordHandler = async ({
  body,
}: ForgotPasswordContext) => {
  const { email } = body;

  const user = userRepository.findByEmail(email);

  if (user === null || user === undefined) {
    return createSuccessResponse({
      message:
        "If the email exists, you will receive a link to reset your password.",
    });
  }

  verificationTokenRepository.deleteByUserId(user.id, "password_reset");

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  verificationTokenRepository.create({
    id: crypto.randomUUID(),
    user_id: user.id,
    token,
    type: "password_reset",
    expires_at: expiresAt,
  });

  await emailService.sendPasswordResetEmail(email, token);

  return createSuccessResponse({
    message:
      "If the email exists, you will receive a link to reset your password.",
  });
};

export const forgotPasswordSchema = {
  body: t.Object({
    email: t.String({
      format: "email",
      description: "Email address to send password reset link",
    }),
  }),
  detail: {
    summary: "Forgot Password",
    description: "Request a password reset link",
    tags: ["Password Reset"],
  },
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
};
