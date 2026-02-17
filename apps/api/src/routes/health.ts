import { Elysia } from "elysia";
import type { Logestic } from "logestic";
import { container } from "@/config/container";
import { logesticPlugin } from "@/config/plugins/generic";
import { db } from "@/database/connection";
import { createLLMService } from "@/services/api/llm";
import { createSuccessResponse } from "@/utils/errors";

interface HealthStatus {
  database: boolean;
  llmService: boolean;
  services: boolean;
}

const HEALTH_CHECK_TIMEOUT = 5000;

async function checkDatabase(): Promise<boolean> {
  try {
    await db.run("SELECT 1");
    return true;
  } catch (_error) {
    return false;
  }
}

function checkLLMService(): Promise<boolean> {
  try {
    createLLMService();
    return Promise.resolve(true);
  } catch (_error) {
    return Promise.resolve(false);
  }
}

function checkServices(): Promise<boolean> {
  try {
    container.resolve("authService");
    container.resolve("threadService");
    container.resolve("llmService");
    return Promise.resolve(true);
  } catch (_error) {
    return Promise.resolve(false);
  }
}

async function performHealthChecks(): Promise<HealthStatus> {
  const [database, llmService, services] = await Promise.all([
    checkDatabase(),
    checkLLMService(),
    checkServices(),
  ]);

  return { database, llmService, services };
}

const healthRoute = new Elysia().use(logesticPlugin).get(
  "/health",
  async ({
    logestic,
    requestId,
  }: {
    logestic: Logestic;
    requestId: string;
  }) => {
    try {
      const healthPromise = performHealthChecks();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Health check timeout")),
          HEALTH_CHECK_TIMEOUT
        )
      );

      const checks = await Promise.race([healthPromise, timeoutPromise]);
      const allHealthy = Object.values(checks).every(Boolean);
      const status = allHealthy ? "ok" : "degraded";

      logestic.info(
        `Health check completed: ${status}. Checks: ${JSON.stringify(checks)}`
      );

      return createSuccessResponse({
        data: {
          status,
          checks,
        },
      });
    } catch (error) {
      logestic.error(
        `[${requestId}] Health check failed: ${(error as Error).message}`
      );
      return createSuccessResponse({
        data: {
          status: "error",
          checks: {
            database: false,
            llmService: false,
            services: false,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }
  },
  {
    detail: {
      tags: ["App"],
      description:
        "Comprehensive health check endpoint with database, LLM service, and critical services verification",
    },
  }
);

export { healthRoute as appRoute };
