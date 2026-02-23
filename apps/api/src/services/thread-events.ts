import { EventEmitter } from "node:events";

export interface ThreadEvent {
  threadId: string;
  timestamp: string;
  type: "created" | "deleted" | "updated";
  userId: string;
}

class ThreadEventEmitter extends EventEmitter {
  private static instance: ThreadEventEmitter;

  private constructor() {
    super();
  }

  static getInstance(): ThreadEventEmitter {
    if (!ThreadEventEmitter.instance) {
      ThreadEventEmitter.instance = new ThreadEventEmitter();
    }
    return ThreadEventEmitter.instance;
  }

  emitThreadCreated(userId: string, threadId: string) {
    const event: ThreadEvent = {
      type: "created",
      threadId,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.emit(`thread:${userId}`, event);
  }

  emitThreadDeleted(userId: string, threadId: string) {
    const event: ThreadEvent = {
      type: "deleted",
      threadId,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.emit(`thread:${userId}`, event);
  }

  emitThreadUpdated(userId: string, threadId: string) {
    const event: ThreadEvent = {
      type: "updated",
      threadId,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.emit(`thread:${userId}`, event);
  }
}

export const threadEmitter = ThreadEventEmitter.getInstance();
