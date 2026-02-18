import { Elysia } from "elysia";
import { authMiddleware } from "@/config/plugins/auth-middleware";
import { logesticPlugin } from "@/config/plugins/generic";
import { loginHandler, loginSchema } from "./login";
import { logoutHandler, logoutSchema } from "./logout";
import {
  completeOnboardingHandler,
  completeOnboardingSchema,
} from "./onboarding";
import { signupHandler, signupSchema } from "./signup";
import { userHandler, userSchema } from "./user";
import { verifyRoutes } from "./verify";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(logesticPlugin)
  .post("/login", loginHandler, loginSchema)
  .post("/signup", signupHandler, signupSchema)
  .use(verifyRoutes)
  .onBeforeHandle(authMiddleware)
  .post("/logout", logoutHandler, logoutSchema)
  .get("/me", userHandler, userSchema)
  .patch("/onboarding", completeOnboardingHandler, completeOnboardingSchema);
