import { Elysia } from "elysia";
import { authMiddleware } from "@/config/plugins/auth-middleware";
import { logesticPlugin } from "@/config/plugins/generic";

import { archiveHandler, archiveSchema } from "./archive";
import {
  bulkArchiveHandler,
  bulkArchiveSchema,
  bulkDeleteHandler,
  bulkDeleteSchema,
} from "./bulk";
import { createHandler, createSchema } from "./create";
import { deleteHandler, deleteSchema } from "./delete";
import { listHandler, listSchema } from "./list";
import { messagesHandler, messagesSchema } from "./messages";

export const threadsRoutes = new Elysia({ prefix: "/threads" })
  .use(logesticPlugin)
  .onBeforeHandle(authMiddleware)
  .get("/", listHandler, listSchema)
  .get("/:id/messages", messagesHandler, messagesSchema)
  .post("/", createHandler, createSchema)
  .put("/:id/archive", archiveHandler, archiveSchema)
  .delete("/:id", deleteHandler, deleteSchema)
  .post("/bulk/archive", bulkArchiveHandler, bulkArchiveSchema)
  .delete("/bulk", bulkDeleteHandler, bulkDeleteSchema);
