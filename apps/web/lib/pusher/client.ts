import Pusher, { type Channel } from "pusher-js";
import { z } from "zod";

const webPusherEnvSchema = z.object({
  NEXT_PUBLIC_PUSHER_KEY: z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().optional(),
});

const parsedPusher = webPusherEnvSchema.parse({
  NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
});

// Pusher client instance
// Initialized only if key and cluster are available
// This is for future use with notifications (not chat - chat uses SSE)
let pusherClient: Pusher | null = null;

/**
 * Check if Pusher is configured and available on the frontend
 */
export function isPusherConfigured(): boolean {
  return (
    typeof window !== "undefined" &&
    !!parsedPusher.NEXT_PUBLIC_PUSHER_KEY &&
    !!parsedPusher.NEXT_PUBLIC_PUSHER_CLUSTER
  );
}

/**
 * Initialize Pusher client (singleton)
 * Call this once when the app loads
 */
export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (
    !(
      parsedPusher.NEXT_PUBLIC_PUSHER_KEY &&
      parsedPusher.NEXT_PUBLIC_PUSHER_CLUSTER
    )
  ) {
    console.warn("Pusher not configured - key or cluster missing");
    return null;
  }

  if (!pusherClient) {
    pusherClient = new Pusher(parsedPusher.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: parsedPusher.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
  }

  return pusherClient;
}

/**
 * Subscribe to a thread channel for real-time updates
 * Used for future notification features (not chat)
 */
export function subscribeToThread(threadId: string): Channel | null {
  const client = getPusherClient();
  if (!client) {
    return null;
  }

  const channelName = `thread-${threadId}`;
  return client.subscribe(channelName);
}

/**
 * Subscribe to a user channel for notification updates
 * Used for future notification features
 */
export function subscribeToUser(userId: string): Channel | null {
  const client = getPusherClient();
  if (!client) {
    return null;
  }

  const channelName = `user-${userId}`;
  return client.subscribe(channelName);
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribeFromChannel(channelName: string): void {
  const client = getPusherClient();
  if (client) {
    client.unsubscribe(channelName);
  }
}

/**
 * Disconnect Pusher client
 * Call this when the user logs out or when cleaning up
 */
export function disconnectPusher(): void {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
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
