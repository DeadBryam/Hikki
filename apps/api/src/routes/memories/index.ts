import { Elysia } from "elysia";
import { authMiddleware } from "@/config/plugins/auth-middleware";
import { logesticPlugin } from "@/config/plugins/generic";

import { createHandler, createSchema } from "./create";
import { deleteHandler, deleteSchema } from "./delete";
import { listHandler, listSchema } from "./list";

export const memoriesRoutes = new Elysia({ prefix: "/memories" })
  .use(logesticPlugin)
  .onBeforeHandle(authMiddleware)
  .get("/", listHandler, listSchema)
  .post("/", createHandler, createSchema)
  .delete("/:id", deleteHandler, deleteSchema);
