import { Elysia, t } from "elysia";
import { createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema } from "@/utils/schemas";
import { env } from "../config/env";

export const limitsRoutes = new Elysia({
  prefix: "/limits",
}).get(
  "/",
  () => {
    return createSuccessResponse({
      data: {
        maxMessageLength: env.CHAT_MAX_MESSAGE_LENGTH,
        maxMessages: env.CHAT_MAX_MESSAGES,
      },
      message: "Limits retrieved successfully",
    });
  },
  {
    response: {
      200: createDataResponseSchema(
        t.Object({
          maxMessageLength: t.Number(),
          maxMessages: t.Number(),
        })
      ),
    },
  }
);
