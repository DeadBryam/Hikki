import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Pusher = require("pusher");

const pusherEnvSchema = z.object({
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
});

const parsedPusher = pusherEnvSchema.parse(process.env);

// Pusher instance for server-side triggering
// Initialized only if all required env vars are present
// This is for future use with notifications (not chat - chat uses SSE)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pusherServer: any = null;

if (
  parsedPusher.PUSHER_APP_ID &&
  parsedPusher.PUSHER_KEY &&
  parsedPusher.PUSHER_SECRET &&
  parsedPusher.PUSHER_CLUSTER
) {
  pusherServer = new Pusher({
    appId: parsedPusher.PUSHER_APP_ID,
    key: parsedPusher.PUSHER_KEY,
    secret: parsedPusher.PUSHER_SECRET,
    cluster: parsedPusher.PUSHER_CLUSTER,
    useTLS: true,
  });
}

/**
 * Check if Pusher is configured and available
 */
export function isPusherConfigured(): boolean {
  return pusherServer !== null;
}

/**
 * Trigger an event on a per-thread channel
 * Used for notifying clients about thread-related events
 */
export async function triggerThreadEvent(
  threadId: string,
  eventName: string,
  data: unknown
): Promise<boolean> {
  if (!pusherServer) {
    console.warn("Pusher not configured - skipping trigger");
    return false;
  }

  const channel = `thread-${threadId}`;
  await pusherServer.trigger(channel, eventName, data);
  return true;
}

/**
 * Trigger an event on a user notification channel
 * Used for notifying users about their notifications
 */
export async function triggerUserNotification(
  userId: string,
  eventName: string,
  data: unknown
): Promise<boolean> {
  if (!pusherServer) {
    console.warn("Pusher not configured - skipping trigger");
    return false;
  }

  const channel = `user-${userId}`;
  await pusherServer.trigger(channel, eventName, data);
  return true;
}

/**
 * Type-safe event names for thread events
 */
export const ThreadEvents = {
  NEW_MESSAGE: "new-message",
  MESSAGE_UPDATED: "message-updated",
  MESSAGE_DELETED: "message-deleted",
  THREAD_UPDATED: "thread-updated",
} as const;

/**
 * Type-safe event names for user notification events
 */
export const NotificationEvents = {
  NEW_NOTIFICATION: "new-notification",
  NOTIFICATION_READ: "notification-read",
} as const;

export type ThreadEvent = (typeof ThreadEvents)[keyof typeof ThreadEvents];
export type NotificationEvent =
  (typeof NotificationEvents)[keyof typeof NotificationEvents];
