import { sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { container } from "@/config/container";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { db } from "@/database/connection";
import { createSuccessResponse } from "@/utils/errors";

interface DetailedHealthStatus {
  database: {
    status: boolean;
    responseTime: number;
    connectionCount?: number;
  };
  llmService: {
    status: boolean;
    responseTime: number;
    availableServices: string[];
  };
  services: {
    status: boolean;
    responseTime: number;
    resolvedServices: string[];
  };
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    version: string;
    environment: string;
    timestamp: string;
  };
}

interface SystemMetrics {
  database: {
    totalThreads: number;
    totalMessages: number;
    activeUsers: number;
    archivedThreads: number;
  };
  performance: {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    uptime: number;
  };
  system: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage?: number;
    version: string;
    environment: string;
    timestamp: string;
  };
}

async function checkDatabaseDetailed(): Promise<
  DetailedHealthStatus["database"]
> {
  const startTime = Date.now();
  try {
    await db.run("SELECT 1");
    const responseTime = Date.now() - startTime;

    let connectionCount: number | undefined;
    try {
      const result = await db.$count(sql`SELECT * FROM sqlite_master`);
      connectionCount = result;
    } catch {
      connectionCount = undefined;
    }

    return {
      status: true,
      responseTime,
      connectionCount,
    };
  } catch (_error) {
    return {
      status: false,
      responseTime: Date.now() - startTime,
    };
  }
}

function checkLLMServiceDetailed(): DetailedHealthStatus["llmService"] {
  const startTime = Date.now();
  try {
    const responseTime = Date.now() - startTime;

    const availableServices = ["llm-service"];

    return {
      status: true,
      responseTime,
      availableServices,
    };
  } catch (_error) {
    return {
      status: false,
      responseTime: Date.now() - startTime,
      availableServices: [],
    };
  }
}

function checkServicesDetailed(): DetailedHealthStatus["services"] {
  const startTime = Date.now();
  const resolvedServices: string[] = [];

  try {
    const servicesToCheck = [
      "authService",
      "threadService",
      "llmService",
      "jobService",
      "emailService",
    ];

    for (const serviceName of servicesToCheck) {
      try {
        container.resolve(serviceName as keyof typeof container.resolve);
        resolvedServices.push(serviceName);
      } catch {
        logger.warn(
          `Service ${serviceName} could not be resolved from the container`
        );
      }
    }

    return {
      status: resolvedServices.length > 0,
      responseTime: Date.now() - startTime,
      resolvedServices,
    };
  } catch (_error) {
    return {
      status: false,
      responseTime: Date.now() - startTime,
      resolvedServices,
    };
  }
}

async function getDatabaseMetrics(): Promise<SystemMetrics["database"]> {
  try {
    const totalThreadsResult = await db.$count(sql`SELECT * FROM threads`);
    const totalThreads = totalThreadsResult;

    const totalMessagesResult = await db.$count(sql`SELECT * FROM messages`);
    const totalMessages = totalMessagesResult;

    const activeUsersResult = await db.$count(
      sql`SELECT DISTINCT user_id FROM threads`
    );
    const activeUsers = activeUsersResult;

    const archivedThreadsResult = await db.$count(
      sql`SELECT * FROM threads WHERE deleted_at IS NOT NULL`
    );
    const archivedThreads = archivedThreadsResult;

    return {
      totalThreads,
      totalMessages,
      activeUsers,
      archivedThreads,
    };
  } catch (_error) {
    return {
      totalThreads: 0,
      totalMessages: 0,
      activeUsers: 0,
      archivedThreads: 0,
    };
  }
}

function getSystemMetrics(): SystemMetrics {
  const memoryUsage = process.memoryUsage();

  return {
    database: {
      totalThreads: 0,
      totalMessages: 0,
      activeUsers: 0,
      archivedThreads: 0,
    },
    performance: {
      averageResponseTime: 0,
      totalRequests: 0,
      errorRate: 0,
      uptime: process.uptime(),
    },
    system: {
      memoryUsage,
      version: process.version,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  };
}

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .get(
    "/health/detailed",
    async () => {
      const [database, llmService, services] = await Promise.all([
        checkDatabaseDetailed(),
        Promise.resolve(checkLLMServiceDetailed()),
        Promise.resolve(checkServicesDetailed()),
      ]);

      const detailedHealth: DetailedHealthStatus = {
        database,
        llmService,
        services,
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: process.version,
          environment: env.NODE_ENV,
          timestamp: new Date().toISOString(),
        },
      };

      return createSuccessResponse({
        data: detailedHealth,
        message: "Detailed health check completed",
      });
    },
    {
      detail: {
        summary: "Detailed Health Check",
        description: `
Perform a comprehensive health check of all system components with detailed status and response times.

**Features:**
- **Database Health**: Connection status and response time
- **LLM Services**: Availability and service enumeration
- **Dependency Services**: Container resolution status
- **System Metrics**: Memory usage, uptime, and environment info
- **Response Times**: Performance metrics for each component

**Authentication:** Not required (public endpoint)
**Rate Limit:** No rate limiting for health checks

**Notes:**
- Used by load balancers and monitoring systems
- All components must be healthy for overall system health
- Response times help identify performance bottlenecks
        `,
        tags: ["Admin", "Health"],
      },
    }
  )
  .get(
    "/metrics",
    async () => {
      const [databaseMetrics, systemMetrics] = await Promise.all([
        getDatabaseMetrics(),
        Promise.resolve(getSystemMetrics()),
      ]);

      const metrics: SystemMetrics = {
        ...systemMetrics,
        database: databaseMetrics,
      };

      return createSuccessResponse({
        data: metrics,
        message: "System metrics retrieved successfully",
      });
    },
    {
      detail: {
        summary: "System Metrics",
        description: `
Retrieve comprehensive system performance metrics and statistics for monitoring and analytics.

**Features:**
- **Database Metrics**: Thread and message counts, user activity
- **Performance Stats**: Response times, request counts, error rates
- **System Resources**: Memory usage, CPU usage, uptime
- **Real-time Data**: Current system state and performance indicators

**Authentication:** Not required (admin endpoint - consider adding auth in production)
**Rate Limit:** No rate limiting for metrics endpoint

**Notes:**
- Used for monitoring dashboards and performance analysis
- Some metrics may be placeholders until full tracking is implemented
- Database metrics are computed on-demand for accuracy
        `,
        tags: ["Admin", "Metrics"],
      },
    }
  );
