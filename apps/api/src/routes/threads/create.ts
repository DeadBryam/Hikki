import { t } from "elysia";
import { threadService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

interface CreateThreadBody {
  title?: string;
}

export const createHandler = (
  context: AuthenticatedContext<CreateThreadBody>
): ApiResponse<{ id: string; title: string }> | ErrorResponse => {
  const { body, user } = context;
  const { title } = body;

  const thread = threadService.createThread(user.id, title);

  return createSuccessResponse({
    data: {
      id: thread.id,
      title: thread.title,
    },
    message: "Thread created successfully",
  });
};

export const createSchema = {
  body: t.Object({
    title: t.Optional(
      t.String({
        minLength: 1,
        maxLength: 200,
        description: "Optional title for the thread",
        examples: ["AI Chat", "Programming Questions"],
      })
    ),
  }),
  response: {
    200: createDataResponseSchema(
      t.Object({
        id: t.String({
          format: "uuid",
          description: "Unique identifier for the created thread",
        }),
        title: t.String({
          description: "Title of the created thread",
        }),
      })
    ),
    ...errorSchemas,
  },
  detail: {
    summary: "Create a New Thread",
    description: `
Create a new conversation thread for the authenticated user.

**Features:**
- **Optional Title**: Provide a custom title or auto-generate one
- **Auto-generated ID**: UUID is automatically generated
- **Rate Limit**: 30 requests per minute for write operations

**Authentication:** Required (Session cookie)
**Rate Limit:** 30 requests per minute for write operations
    `,
    tags: ["Threads"],
    examples: [
      {
        summary: "Create thread with custom title",
        description: "Create a thread with a specific title",
        value: {
          title: "AI Programming Assistant",
        },
      },
      {
        summary: "Create thread without title",
        description: "Create a thread with auto-generated title",
        value: {},
      },
    ],
  },
};
