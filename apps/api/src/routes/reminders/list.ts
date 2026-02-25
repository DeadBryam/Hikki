import { t } from "elysia";
import { reminderService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

export const listHandler = (
  context: AuthenticatedContext
):
  | ApiResponse<
      Array<{
        id: string;
        message: string;
        type: string;
        status: string;
        schedule_at: string;
        repeat_pattern: string | null;
        channel: string;
        created_at: string;
      }>
    >
  | ErrorResponse => {
  const { user } = context;

  try {
    const reminders = reminderService.getReminders(user.id);

    return createSuccessResponse({
      data: reminders.map(
        (reminder: {
          id: string;
          message: string;
          type: string;
          status: string;
          schedule_at: string;
          repeat_pattern: string | null;
          channel: string;
          created_at: string;
        }) => ({
          id: reminder.id,
          message: reminder.message,
          type: reminder.type,
          status: reminder.status,
          schedule_at: reminder.schedule_at,
          repeat_pattern: reminder.repeat_pattern,
          channel: reminder.channel,
          created_at: reminder.created_at || "",
        })
      ),
      message: "Reminders retrieved successfully",
    });
  } catch (error) {
    return createErrorResponse<undefined>((error as Error).message, {
      code: "LIST_REMINDERS_FAILED",
    });
  }
};

export const listSchema = {
  response: {
    200: createDataResponseSchema(
      t.Array(
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
          repeat_pattern: t.Union([t.String(), t.Null()], {
            description: "Repeat pattern for recurrent reminders",
          }),
          channel: t.String({
            description: "Notification channel: all, in-app, email, push",
          }),
          created_at: t.String({
            description: "Creation timestamp",
          }),
        })
      )
    ),
    ...errorSchemas,
  },
  detail: {
    summary: "List Reminders",
    description: `
Retrieve a list of reminders for the authenticated user.

**Features:**
- List all active and past reminders

**Authentication:** Required (Session cookie)
    `,
    tags: ["Reminders"],
  },
};
