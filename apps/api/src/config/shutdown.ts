import { sqlite } from "../database/connection";
import { logger } from "./logger";

/**
 * Graceful shutdown handler
 * Handles SIGTERM and SIGINT signals to ensure clean server shutdown
 */
export const gracefulShutdown = async (signal: string) => {
  logger.debug(`⚠️ [${signal}] Received signal`);

  try {
    await sqlite.close();
    logger.info("🗃️ Database connection closed");

    logger.info("🦊 Elysia server has shut down gracefully");
    await process.exit(0);
  } catch (error) {
    logger.error(`❌ Error during shutdown: ${(error as Error).message}`);
    process.exit(1);
  }
};

/**
 * Setup signal handlers for graceful shutdown
 */
export const setupShutdownHandlers = () => {
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  logger.info("⚠️ Shutdown handlers configured");
};
