import { t } from "elysia";
import { threadService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

export const pinHandler = (
  context: AuthenticatedContext
): ApiResponse<void> | ErrorResponse => {
  const { params, set, user } = context;
  const { id } = params;

  const success = threadService.togglePinConversation(id, user.id);

  if (success === false) {
    set.status = 404;
    return createErrorResponse<undefined>("Thread not found", {
      code: "THREAD_NOT_FOUND",
    });
  }

  return createSuccessResponse({
    message: "Conversation pin toggled successfully",
  });
};

export const pinSchema = {
  params: t.Object({
    id: t.String({
      format: "uuid",
      description:
        "Thread ID (UUID format) - must belong to the authenticated user",
      error: "Thread ID must be a valid UUID",
      examples: [
        "550e8400-e29b-41d4-a716-446655440000",
        "123e4567-e89b-12d3-a456-426614174000",
      ],
    }),
  }),
  body: t.Object({}),
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
  detail: {
    summary: "Toggle Pin on a Thread",
    description: `
Toggle the pin status of a conversation thread. If pinned, it will be unpinned; if unpinned, it will be pinned.
Pinned threads appear at the top of the thread list.

**Features:**
- **Quick Access**: Pinned threads are always visible at the top
- **Toggle Action**: Automatically pins or unpins based on current state
- **Access Control**: Only thread owner can pin/unpin their threads

**Authentication:** Required (Session cookie)
**Rate Limit:** 60 requests per minute for write operations

**Notes:**
- Pinned threads are sorted by update time within the pinned section
- There is no limit on the number of pinned threads
    `,
    tags: ["Threads"],
  },
};
