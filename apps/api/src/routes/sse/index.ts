import { Elysia } from "elysia";
import { memoriesSseRoute } from "./memories";
import { threadsSseRoute } from "./threads";

export const sseRoutes = new Elysia({ prefix: "/sse" })
  .use(memoriesSseRoute)
  .use(threadsSseRoute);
