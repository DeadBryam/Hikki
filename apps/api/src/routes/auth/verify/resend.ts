import { t } from "elysia";
import {
  emailService,
  userRepository,
  verificationTokenRepository,
} from "@/config/dependencies";
import type { ExtendedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

interface ResendVerificationBody {
  email: string;
}

const RATE_LIMIT_MS = 5 * 60 * 1000;

const resendAttempts = new Map<string, number>();

function getRemainingTime(email: string): number {
  const lastAttempt = resendAttempts.get(email);
  if (!lastAttempt) {
    return 0;
  }

  const elapsed = Date.now() - lastAttempt;
  const remaining = Math.max(0, RATE_LIMIT_MS - elapsed);
  return Math.ceil(remaining / 1000);
}

function canResend(email: string): boolean {
  return getRemainingTime(email) === 0;
}

function recordAttempt(email: string): void {
  resendAttempts.set(email, Date.now());
}

export const resendVerificationHandler = async ({
  body,
  set,
}: ExtendedContext<ResendVerificationBody>) => {
  const { email } = body;

  if (!canResend(email)) {
    const remaining = getRemainingTime(email);
    set.status = 429;
    return createErrorResponse(
      "Please wait before requesting another verification email.",
      {
        data: { remaining },
        code: "CODE_RATE_LIMITED",
      }
    );
  }

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
  recordAttempt(email);

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
