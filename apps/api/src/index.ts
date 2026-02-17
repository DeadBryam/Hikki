import dotenv from "dotenv";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { logger } from "./config/logger";
import "./types/context";
import { errorHandler } from "./config/error-handler";
import { cleanupCron, processJobsCron } from "./config/plugins/cron";
import {
  corsPlugin,
  logesticPlugin,
  securityHeadersPlugin,
  serveConfig,
} from "./config/plugins/generic";
import { ipMiddleware } from "./config/plugins/ip-middleware";
import { genericRateLimit } from "./config/plugins/rate-limits";
import { requestIdMiddleware } from "./config/plugins/request-id";
import { swaggerPlugin } from "./config/plugins/swagger";
import { setupShutdownHandlers } from "./config/shutdown";
import { initDatabase } from "./database/connection";
import { adminRoutes } from "./routes/admin";
import { aiDocsIndex } from "./routes/ai";
import { authRoutes } from "./routes/auth";
import { chatRoute } from "./routes/chat";
import { appRoute } from "./routes/health";
import { rootRoute } from "./routes/root";
import { threadsRoutes } from "./routes/threads";

dotenv.config();

await initDatabase();

const app = new Elysia(serveConfig)
  .use(corsPlugin)
  .derive(ipMiddleware)
  .use(requestIdMiddleware)
  .use(securityHeadersPlugin)
  .use(processJobsCron)
  .use(cleanupCron)
  .use(swaggerPlugin)
  .use(genericRateLimit)
  .use(logesticPlugin)
  .onError(errorHandler)
  .use(rootRoute)
  .use(aiDocsIndex)
  .group("/api/v1", (app) =>
    app
      .use(appRoute)
      .use(chatRoute)
      .use(authRoutes)
      .use(threadsRoutes)
      .use(adminRoutes)
  );

export { app };

app.listen(env.PORT, ({ hostname, port }) => {
  logger.info(`🦊 Elysia is running at ${hostname}:${port}`);
});

setupShutdownHandlers();
