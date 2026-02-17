import { Elysia } from "elysia";
import { authMiddleware } from "@/config/plugins/auth-middleware";
import { logesticPlugin } from "@/config/plugins/generic";
import { chatHandler, chatSchema } from "./chat";

export const chatRoute = new Elysia({ prefix: "/chat" })
  .use(logesticPlugin)
  .onBeforeHandle(authMiddleware)
  .post("/", chatHandler, chatSchema);
