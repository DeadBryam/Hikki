import type { Context } from "elysia";
import { t } from "elysia";
import {
  authService,
  userRepository,
  verificationTokenRepository,
} from "@/config/dependencies";
import { env } from "@/config/env";

interface VerifyEmailGetContext extends Context {
  query: { token: string };
}

export const verifyEmailGetHandler = async ({
  query,
  redirect,
  cookie,
}: VerifyEmailGetContext) => {
  const { token } = query;

  const verificationToken = verificationTokenRepository.findByToken(token);

  if (!verificationToken) {
    return redirect(`${env.FRONT_END_URL}/auth/verify?error=invalid_token`);
  }

  if (verificationToken.type !== "email_verification") {
    return redirect(`${env.FRONT_END_URL}/auth/verify?error=invalid_token`);
  }

  userRepository.setEmailVerified(verificationToken.user_id, true);
  verificationTokenRepository.delete(verificationToken.id);

  const session = await authService.createSession(verificationToken.user_id);
  authService.setValidSessionCookie(
    { cookie },
    session.token,
    60 * 60 * 24 * 30
  );

  return redirect(`${env.FRONT_END_URL}/auth/verify?success=true`);
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
