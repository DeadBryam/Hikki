import type { Context } from "elysia";
import { t } from "elysia";
import {
  authService,
  userRepository,
  verificationTokenRepository,
} from "@/config/dependencies";

interface VerifyEmailGetContext extends Context {
  query: { token: string };
}

export const verifyEmailGetHandler = async ({
  query,
  set,
  cookie,
}: VerifyEmailGetContext) => {
  const { token } = query;

  const verificationToken = verificationTokenRepository.findByToken(token);

  if (!verificationToken) {
    set.status = 400;
    return { success: false, error: "invalid_token" };
  }

  if (verificationToken.type !== "email_verification") {
    set.status = 400;
    return { success: false, error: "invalid_token" };
  }

  userRepository.setEmailVerified(verificationToken.user_id, true);
  verificationTokenRepository.delete(verificationToken.id);

  const session = await authService.createSession(verificationToken.user_id);
  authService.setValidSessionCookie(
    { cookie },
    session.token,
    60 * 60 * 24 * 30
  );

  set.status = 200;
  return { success: true };
};

export const verifyEmailGetSchema = {
  query: t.Object({
    token: t.String({ description: "Verification token" }),
  }),
  detail: {
    summary: "Verify Email (GET)",
    description:
      "Verify user email with token from link (redirects to frontend)",
    tags: ["Verification"],
  },
};
