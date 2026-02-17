import type { Context } from "elysia";
import { t } from "elysia";
import { verificationTokenRepository } from "@/config/dependencies";

export const validateResetTokenHandler = ({
  query,
  set,
}: Context & { query: { token: string } }) => {
  const { token } = query;

  const verificationToken = verificationTokenRepository.findByToken(token);

  if (!verificationToken) {
    set.status = 400;
    return {
      success: false,
      valid: false,
      error: "Invalid or expired token",
      timestamp: new Date().toISOString(),
    };
  }

  if (verificationToken.type !== "password_reset") {
    set.status = 400;
    return {
      success: false,
      valid: false,
      error: "Invalid token type",
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    valid: true,
    timestamp: new Date().toISOString(),
  };
};

export const validateResetTokenSchema = {
  query: t.Object({
    token: t.String({ description: "Password reset token to validate" }),
  }),
  detail: {
    summary: "Validate Reset Token",
    description: "Check if a password reset token is valid",
    tags: ["Password Reset"],
  },
  response: {
    200: t.Object({
      success: t.Boolean({ description: "Request successful" }),
      valid: t.Boolean({ description: "Token is valid" }),
      timestamp: t.String({ description: "Timestamp of the response" }),
    }),
    400: t.Object({
      success: t.Boolean({ description: "Request failed" }),
      valid: t.Boolean({ description: "Token is invalid" }),
      error: t.String({ description: "Error message" }),
      timestamp: t.String({ description: "Timestamp of the response" }),
    }),
  },
};
