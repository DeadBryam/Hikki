import { t } from "elysia";
import { threadService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createSuccessResponse } from "@/utils/errors";
import { errorSchemas } from "@/utils/schemas";

interface BulkArchiveRequest {
  threadIds: string[];
}

interface BulkDeleteRequest {
  threadIds: string[];
}

export const bulkArchiveHandler = (
  context: AuthenticatedContext<BulkArchiveRequest>
): ApiResponse<{ archived: string[]; failed: string[] }> | ErrorResponse => {
  const { body, user } = context;
  const { threadIds } = body;

  const results = {
    archived: [] as string[],
    failed: [] as string[],
  };

  for (const threadId of threadIds) {
    const success = threadService.archiveConversation(threadId, user.id);
    if (success) {
      results.archived.push(threadId);
    } else {
      results.failed.push(threadId);
    }
  }

  return createSuccessResponse({
    data: results,
    message: `Archived ${results.archived.length} threads, ${results.failed.length} failed`,
  });
};

export const bulkDeleteHandler = (
  context: AuthenticatedContext<BulkDeleteRequest>
): ApiResponse<{ deleted: string[]; failed: string[] }> | ErrorResponse => {
  const { body, user } = context;
  const { threadIds } = body;

  const results = {
    deleted: [] as string[],
    failed: [] as string[],
  };

  for (const threadId of threadIds) {
    const success = threadService.deleteConversation(threadId, user.id);
    if (success) {
      results.deleted.push(threadId);
    } else {
      results.failed.push(threadId);
    }
  }

  return createSuccessResponse({
    data: results,
    message: `Deleted ${results.deleted.length} threads, ${results.failed.length} failed`,
  });
};

export const bulkArchiveSchema = {
  body: t.Object({
    threadIds: t.Array(
      t.String({
        format: "uuid",
        description:
          "Thread ID (UUID format) - must belong to the authenticated user",
        error: "Thread ID must be a valid UUID",
        examples: [
          "550e8400-e29b-41d4-a716-446655440000",
          "550e8400-e29b-41d4-a716-446655440001",
        ],
      }),
      {
        minItems: 1,
        maxItems: 50,
        description:
          "Array of thread IDs to archive (1-50 threads per request)",
        examples: [
          [
            "550e8400-e29b-41d4-a716-446655440000",
            "550e8400-e29b-41d4-a716-446655440001",
            "550e8400-e29b-41d4-a716-446655440002",
          ],
          ["123e4567-e89b-12d3-a456-426614174000"],
        ],
      }
    ),
  }),
  response: {
    200: t.Object({
      success: t.Boolean(),
      data: t.Object({
        archived: t.Array(t.String(), {
          description: "List of successfully archived thread IDs",
        }),
        failed: t.Array(t.String(), {
          description:
            "List of thread IDs that could not be archived (not found or access denied)",
        }),
      }),
      message: t.String(),
      timestamp: t.String(),
    }),
    ...errorSchemas,
  },
  detail: {
    summary: "Bulk Archive Threads",
    description: `
Archive multiple conversation threads in a single request. This is useful for cleaning up multiple conversations at once.

**Features:**
- **Batch Processing**: Archive up to 50 threads per request
- **Partial Success**: Returns both successful and failed operations
- **Access Control**: Only threads owned by the authenticated user can be archived
- **Soft Archive**: Threads remain in database but are marked as archived
- **Rate Limit**: 30 requests per minute for write operations

**Authentication:** Required (Session cookie)
**Rate Limit:** 30 requests per minute for write operations

**Notes:**
- Failed operations don't stop the entire batch
- Archived threads won't appear in the default thread list
- All messages within archived threads remain accessible
    `,
    tags: ["Threads"],
    examples: [
      {
        summary: "Archive multiple threads",
        description: "Archive 3 threads successfully",
        value: {
          threadIds: [
            "550e8400-e29b-41d4-a716-446655440000",
            "550e8400-e29b-41d4-a716-446655440001",
            "550e8400-e29b-41d4-a716-446655440002",
          ],
        },
      },
      {
        summary: "Partial success example",
        description: "Archive threads with some failures",
        value: {
          threadIds: [
            "550e8400-e29b-41d4-a716-446655440000",
            "invalid-uuid",
            "550e8400-e29b-41d4-a716-446655440001",
          ],
        },
      },
    ],
  },
};

export const bulkDeleteSchema = {
  body: t.Object({
    threadIds: t.Array(
      t.String({
        format: "uuid",
        description:
          "Thread ID (UUID format) - must belong to the authenticated user",
        error: "Thread ID must be a valid UUID",
        examples: [
          "550e8400-e29b-41d4-a716-446655440000",
          "550e8400-e29b-41d4-a716-446655440001",
        ],
      }),
      {
        minItems: 1,
        maxItems: 50,
        description:
          "Array of thread IDs to permanently delete (1-50 threads per request)",
        examples: [
          [
            "550e8400-e29b-41d4-a716-446655440000",
            "550e8400-e29b-41d4-a716-446655440001",
          ],
          ["123e4567-e89b-12d3-a456-426614174000"],
        ],
      }
    ),
  }),
  response: {
    200: t.Object({
      success: t.Boolean(),
      data: t.Object({
        deleted: t.Array(t.String(), {
          description: "List of successfully deleted thread IDs",
        }),
        failed: t.Array(t.String(), {
          description:
            "List of thread IDs that could not be deleted (not found or access denied)",
        }),
      }),
      message: t.String(),
      timestamp: t.String(),
    }),
    ...errorSchemas,
  },
  detail: {
    summary: "Bulk Delete Threads",
    description: `
Permanently delete multiple conversation threads in a single request. This action cannot be undone.

**Features:**
- **Batch Processing**: Delete up to 50 threads per request
- **Partial Success**: Returns both successful and failed operations
- **Access Control**: Only threads owned by the authenticated user can be deleted
- **Permanent Deletion**: Threads and all associated messages are permanently removed
- **Rate Limit**: 30 requests per minute for write operations

**Authentication:** Required (Session cookie)
**Rate Limit:** 30 requests per minute for write operations

**⚠️ Warning:**
- This operation permanently deletes threads and all their messages
- Deleted data cannot be recovered
- Use archive instead if you might need the conversations later
    `,
    tags: ["Threads"],
    examples: [
      {
        summary: "Delete multiple threads",
        description: "Permanently delete 2 threads",
        value: {
          threadIds: [
            "550e8400-e29b-41d4-a716-446655440000",
            "550e8400-e29b-41d4-a716-446655440001",
          ],
        },
      },
      {
        summary: "Partial deletion example",
        description: "Delete threads with some failures",
        value: {
          threadIds: [
            "550e8400-e29b-41d4-a716-446655440000",
            "non-existent-thread-id",
            "550e8400-e29b-41d4-a716-446655440001",
          ],
        },
      },
    ],
  },
};
