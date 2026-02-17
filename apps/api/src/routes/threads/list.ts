import { t } from "elysia";
import { PAGINATION_CONSTANTS } from "@/config/constants";
import { threadService } from "@/config/dependencies";
import type { PaginatedThreadsResponse } from "@/services/thread-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import {
  generateETag,
  isNotModified,
  setETagAndCacheHeaders,
} from "@/utils/cache";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

export const listHandler = (
  context: AuthenticatedContext
): ApiResponse<PaginatedThreadsResponse> | ErrorResponse | undefined => {
  const { set, query } = context;

  const userId = context.user?.id;
  const {
    limit,
    offset,
    search,
    archived,
    date_from,
    date_to,
    sort_by,
    sort_order,
  } = query;

  const limitNum = limit
    ? Number.parseInt(limit, 10)
    : PAGINATION_CONSTANTS.DEFAULT_LIMIT;
  const offsetNum = offset
    ? Number.parseInt(offset, 10)
    : PAGINATION_CONSTANTS.DEFAULT_OFFSET;

  const validSortBy = ["created_at", "updated_at", "title"] as const;
  const sortBy =
    sort_by && validSortBy.includes(sort_by as any)
      ? (sort_by as (typeof validSortBy)[number])
      : "updated_at";

  const sortOrder = sort_order === "asc" ? "asc" : "desc";

  let archivedBool: boolean | undefined;
  if (archived !== undefined) {
    archivedBool = archived === "true";
  }

  try {
    const result = threadService.getThreads({
      userId,
      limit: limitNum,
      offset: offsetNum,
      search,
      archived: archivedBool,
      dateFrom: date_from,
      dateTo: date_to,
      sortBy,
      sortOrder,
    });

    if (isNotModified(context.request, generateETag(result))) {
      set.status = 304;
      return;
    }

    setETagAndCacheHeaders(set, result);

    return createSuccessResponse({
      data: result,
      message: "Conversations retrieved successfully",
    });
  } catch (error) {
    set.status = 500;
    return createErrorResponse((error as Error).message, {
      code: "LIST_CONVERSATIONS_FAILED",
    });
  }
};

export const listSchema = {
  query: t.Object({
    limit: t.Optional(
      t.Number({
        minimum: 1,
        maximum: 100,
        description: "Number of threads to return (1-100)",
        default: 20,
        examples: [10, 50, 100],
      })
    ),
    offset: t.Optional(
      t.Number({
        minimum: 0,
        description: "Number of threads to skip for pagination",
        default: 0,
        examples: [0, 20, 100],
      })
    ),
    search: t.Optional(
      t.String({
        minLength: 1,
        maxLength: 100,
        description: "Search term to filter threads by title",
        examples: ["AI", "programming", "questions"],
      })
    ),
    archived: t.Optional(
      t.String({
        pattern: "^(true|false)$",
        description: "Filter by archived status",
        examples: ["false", "true"],
      })
    ),
    date_from: t.Optional(
      t.String({
        format: "date",
        description: "Filter threads created after this date (YYYY-MM-DD)",
        examples: ["2024-01-01", "2024-12-01"],
      })
    ),
    date_to: t.Optional(
      t.String({
        format: "date",
        description: "Filter threads created before this date (YYYY-MM-DD)",
        examples: ["2024-12-31", "2025-01-31"],
      })
    ),
    sort_by: t.Optional(
      t.Union(
        [t.Literal("created_at"), t.Literal("updated_at"), t.Literal("title")],
        {
          description: "Field to sort by",
          default: "updated_at",
          examples: ["created_at", "updated_at", "title"],
        }
      )
    ),
    sort_order: t.Optional(
      t.Union([t.Literal("asc"), t.Literal("desc")], {
        description: "Sort order",
        default: "desc",
        examples: ["asc", "desc"],
      })
    ),
  }),
  response: {
    200: createDataResponseSchema(
      t.Object({
        items: t.Array(
          t.Object({
            id: t.String({ description: "Thread unique identifier" }),
            title: t.Optional(
              t.String({
                description: "Thread title (auto-generated or user-defined)",
              })
            ),
            message_count: t.Number({
              description: "Number of messages in the thread",
            }),
            created_at: t.String({ description: "Thread creation timestamp" }),
            updated_at: t.String({
              description: "Thread last update timestamp",
            }),
          })
        ),
        pagination: t.Object({
          page: t.Number({ description: "Current page number" }),
          limit: t.Number({ description: "Items per page" }),
          total: t.Number({ description: "Total number of threads" }),
          totalPages: t.Number({ description: "Total number of pages" }),
          hasNext: t.Boolean({
            description: "Whether there are more pages after current",
          }),
          hasPrev: t.Boolean({
            description: "Whether there are pages before current",
          }),
        }),
      })
    ),
    304: t.Undefined({
      description: "Content not modified (ETag match)",
    }),
    ...errorSchemas,
  },
  detail: {
    summary: "List all Threads",
    description: `
Retrieve a paginated list of threads for the authenticated user with complete pagination metadata.

**Features:**
- **Pagination**: Full pagination with page/limit metadata
- **Filtering**: Search by title, filter by archived status, date ranges
- **Sorting**: Sort by creation date, update date, or title
- **Caching**: Supports ETags for efficient caching
- **Rate Limit**: 60 requests per minute for read operations

**Authentication:** Required (Session cookie)
**Caching:** Supported with ETags
    `,
    tags: ["Threads"],
    examples: [
      {
        summary: "List recent threads",
        description: "Get the most recently updated threads",
        value: {
          limit: 10,
          sort_by: "updated_at",
          sort_order: "desc",
        },
      },
      {
        summary: "Search threads",
        description: "Find threads containing specific keywords",
        value: {
          search: "programming",
          limit: 20,
        },
      },
      {
        summary: "Filter by date range",
        description: "Get threads from a specific time period",
        value: {
          date_from: "2024-01-01",
          date_to: "2024-01-31",
          archived: "false",
        },
      },
    ],
  },
};
