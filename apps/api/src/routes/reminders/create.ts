import { t } from "elysia";
import { reminderService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

export const createHandler = (
  context: AuthenticatedContext
):
  | ApiResponse<{
      id: string;
      message: string;
      type: string;
      status: string;
      schedule_at: string;
      repeat_pattern: string | null;
      channel: string;
      created_at: string;
    }>
  | ErrorResponse => {
  const { body, user } = context;
  const { message, type, schedule_at, repeat_pattern, channel } = body as {
    message: string;
    type: "one-time" | "recurrent";
    schedule_at: string;
    repeat_pattern?: string;
    channel: "in-app" | "email" | "push" | "all";
  };

  try {
    const reminder = reminderService.createReminder({
      userId: user.id,
      message,
      type,
      scheduleAt: schedule_at,
      repeatPattern: repeat_pattern,
      channel,
    });

    return createSuccessResponse({
      data: {
        id: reminder.id,
        message: reminder.message,
        type: reminder.type,
        status: reminder.status,
        schedule_at: reminder.schedule_at,
        repeat_pattern: reminder.repeat_pattern,
        channel: reminder.channel,
        created_at: reminder.created_at || "",
      },
      message: "Reminder created successfully",
    });
  } catch (error) {
    return createErrorResponse<undefined>((error as Error).message, {
      code: "CREATE_REMINDER_FAILED",
    });
  }
};

export const createSchema = {
  body: t.Object({
    message: t.String({
      minLength: 1,
      maxLength: 1000,
      description: "Reminder message",
    }),
    type: t.Union([t.Literal("one-time"), t.Literal("recurrent")], {
      description: "Type of reminder",
    }),
    schedule_at: t.String({
      description: "ISO datetime when the reminder should trigger",
    }),
    repeat_pattern: t.Optional(t.String()),
    channel: t.Union(
      [
        t.Literal("in-app"),
        t.Literal("email"),
        t.Literal("push"),
        t.Literal("all"),
      ],
      {
        description: "Notification channel",
      }
    ),
  }),
  response: {
    201: createDataResponseSchema(
      t.Object({
        id: t.String({
          format: "uuid",
          description: "Reminder unique identifier",
        }),
        message: t.String({
          description: "Reminder message",
        }),
        type: t.String({
          description: "Type of reminder: one-time or recurrent",
        }),
        status: t.String({
          description: "Status: pending, completed, cancelled",
        }),
        schedule_at: t.String({
          description: "When the reminder is scheduled",
        }),
        repeat_pattern: t.Union([t.String(), t.Null()]),
        channel: t.String({
          description: "Notification channel: all, in-app, email, push",
        }),
        created_at: t.String({
          description: "Creation timestamp",
        }),
      })
    ),
    ...errorSchemas,
  },
  detail: {
    summary: "Create Reminder",
    description: `
Create a new reminder for the authenticated user.

**Features:**
- One-time or recurrent reminders
- Multiple notification channels (in-app, email, push)

**Authentication:** Required (Session cookie)
    `,
    tags: ["Reminders"],
  },
};
