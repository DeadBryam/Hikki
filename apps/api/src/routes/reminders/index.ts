import { Elysia } from "elysia";
import { authMiddleware } from "@/config/plugins/auth-middleware";
import { logesticPlugin } from "@/config/plugins/generic";

import { createHandler, createSchema } from "./create";
import { listHandler, listSchema } from "./list";

export const remindersRoutes = new Elysia({ prefix: "/reminders" })
  .use(logesticPlugin)
  .onBeforeHandle(authMiddleware)
  .get("/", listHandler, listSchema)
  .post("/", createHandler, createSchema);
