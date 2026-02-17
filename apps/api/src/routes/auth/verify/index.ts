import { Elysia } from "elysia";
import { logesticPlugin } from "@/config/plugins/generic";
import { verifyEmailGetHandler, verifyEmailGetSchema } from "./email";
import { verifyEmailPostHandler, verifyEmailPostSchema } from "./email-post";
import { forgotPasswordHandler, forgotPasswordSchema } from "./forgot-password";
import { resendVerificationHandler, resendVerificationSchema } from "./resend";
import { resetPasswordHandler, resetPasswordSchema } from "./reset-password";
import {
  validateResetTokenHandler,
  validateResetTokenSchema,
} from "./validate-reset-token";

export const verifyRoutes = new Elysia({ prefix: "/verify" })
  .use(logesticPlugin)
  .get("/email", verifyEmailGetHandler, verifyEmailGetSchema)
  .post("/email", verifyEmailPostHandler, verifyEmailPostSchema)
  .post("/resend", resendVerificationHandler, resendVerificationSchema)
  .post("/forgot-password", forgotPasswordHandler, forgotPasswordSchema)
  .get("/reset-password", validateResetTokenHandler, validateResetTokenSchema)
  .post("/reset-password", resetPasswordHandler, resetPasswordSchema);
