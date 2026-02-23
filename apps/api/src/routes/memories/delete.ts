import { t } from "elysia";
import { memoryService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

export const deleteHandler = (
  context: AuthenticatedContext
): ApiResponse<void> | ErrorResponse => {
  const { params, set, user } = context;
  const { id } = params;

  const success = memoryService.deleteMemory(id, user.id);

  if (success === false) {
    set.status = 404;
    return createErrorResponse<undefined>("Memory not found", {
      code: "MEMORY_NOT_FOUND",
    });
  }

  return createSuccessResponse({
    message: "Memory deleted successfully",
  });
};

export const deleteSchema = {
  params: t.Object({
    id: t.String({
      format: "uuid",
      description:
        "Memory ID (UUID format) - must belong to the authenticated user",
      error: "Memory ID must be a valid UUID",
      examples: [
        "550e8400-e29b-41d4-a716-446655440000",
        "123e4567-e89b-12d3-a456-426614174000",
      ],
    }),
  }),
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
  detail: {
    summary: "Delete a Memory",
    description: `
Delete a memory item. This performs a soft delete by marking the memory as deleted.

**Features:**
- **Soft Delete**: Memory is marked as deleted but remains in database
- **Access Control**: Only memory owner can delete their memories
- **Rate Limit**: 30 requests per minute for write operations

**Authentication:** Required (Session cookie)
**Rate Limit:** 30 requests per minute for write operations

**Notes:**
- Deleted memories won't appear in the memory list
    `,
    tags: ["Memories"],
    examples: [
      {
        summary: "Delete a memory successfully",
        description: "Delete an existing memory by its ID",
        value: {
          id: "550e8400-e29b-41d4-a716-446655440000",
        },
      },
    ],
  },
};
