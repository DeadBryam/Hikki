import type { Context } from "elysia";
import { t } from "elysia";
import {
  authService,
  verificationTokenRepository,
} from "@/config/dependencies";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

interface ResetPasswordBody {
  password: string;
  token: string;
}

interface ResetPasswordContext extends Context {
  body: ResetPasswordBody;
}

export const resetPasswordHandler = async ({
  body,
  set,
}: ResetPasswordContext) => {
  const { token, password } = body;

  const verificationToken = verificationTokenRepository.findByToken(token);

  if (!verificationToken) {
    set.status = 400;
    return {
      success: false,
      error: "Invalid or expired token",
      timestamp: new Date().toISOString(),
    };
  }

  if (verificationToken.type !== "password_reset") {
    set.status = 400;
    return {
      success: false,
      error: "Invalid token type",
      timestamp: new Date().toISOString(),
    };
  }

  await authService.updatePassword(verificationToken.user_id, password);
  authService.invalidateAllUserSessions(verificationToken.user_id);
  verificationTokenRepository.delete(verificationToken.id);

  return {
    success: true,
    message: "Password updated successfully. You can now log in.",
    timestamp: new Date().toISOString(),
  };
};

export const resetPasswordSchema = {
  body: t.Object({
    token: t.String({ description: "Password reset token" }),
    password: t.String({
      description:
        "New password (min 8 chars, uppercase, lowercase, number, special char)",
      minLength: 8,
      maxLength: 128,
      pattern:
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$',
    }),
  }),
  detail: {
    summary: "Reset Password",
    description: "Reset password with token",
    tags: ["Password Reset"],
  },
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
};
