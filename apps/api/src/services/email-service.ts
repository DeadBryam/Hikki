import { Resend } from "resend";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

export interface EmailResult {
  success: boolean;
}

export class EmailService {
  private readonly resend: Resend | null = null;

  constructor() {
    if (env.NODE_ENV === "production" && env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string
  ): Promise<EmailResult> {
    const verifyUrl = `${env.FRONT_END_URL}/auth/verify?token=${token}`;

    if (!this.resend) {
      logger.info(`[DEV] Verification URL: ${verifyUrl}`);
      logger.info(`[DEV] Token: ${token}`);
      return { success: true };
    }

    const fromEmail = env.RESEND_FROM_EMAIL;

    const { error } = await this.resend.emails.send({
      from: `${env.APP_NAME} <${fromEmail}>`,
      to: email,
      subject: `Verify your ${env.APP_NAME} account`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to ${env.APP_NAME}</h1>
          <p style="color: #666; font-size: 16px;">Click the button below to verify your account:</p>
          <a href="${verifyUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify my account
          </a>
          <p style="color: #999; font-size: 14px;">This link expires in 24 hours.</p>
          <p style="color: #999; font-size: 14px;">If you didn't create this account, please ignore this message.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            <a href="${verifyUrl}" style="color: #0070f3;">${verifyUrl}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Or copy your verification token:</p>
          <p style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px; word-break: break-all; color: #333;">${token}</p>
        </body>
        </html>
      `,
    });

    if (error) {
      logger.error(`Error sending verification email: ${error.message}`);
      return { success: false };
    }

    return { success: true };
  }

  async sendPasswordResetEmail(
    email: string,
    token: string
  ): Promise<EmailResult> {
    const resetUrl = `${env.FRONT_END_URL}/auth/reset-password?token=${token}`;

    if (!this.resend) {
      logger.info(`[DEV] Password reset URL: ${resetUrl}`);
      logger.info(`[DEV] Token: ${token}`);
      return { success: true };
    }

    const fromEmail = env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const { error } = await this.resend.emails.send({
      from: `${env.APP_NAME} <${fromEmail}>`,
      to: email,
      subject: `Reset your ${env.APP_NAME} password`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Reset Password</h1>
          <p style="color: #666; font-size: 16px;">Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this message.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            <a href="${resetUrl}" style="color: #0070f3;">${resetUrl}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Or copy your reset token:</p>
          <p style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px; word-break: break-all; color: #333;">${token}</p>
        </body>
        </html>
      `,
    });

    if (error) {
      logger.error(`Error sending password reset email: ${error.message}`);
      return { success: false };
    }

    return { success: true };
  }
}
