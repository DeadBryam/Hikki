import { EventEmitter } from "node:events";

export interface MemoryEvent {
  memoryId: string;
  timestamp: string;
  type: "created" | "deleted";
  userId: string;
}

class MemoryEventEmitter extends EventEmitter {
  private static instance: MemoryEventEmitter;

  private constructor() {
    super();
  }

  static getInstance(): MemoryEventEmitter {
    if (!MemoryEventEmitter.instance) {
      MemoryEventEmitter.instance = new MemoryEventEmitter();
    }
    return MemoryEventEmitter.instance;
  }

  emitMemoryCreated(userId: string, memoryId: string) {
    const event: MemoryEvent = {
      type: "created",
      memoryId,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.emit(`memory:${userId}`, event);
  }

  emitMemoryDeleted(userId: string, memoryId: string) {
    const event: MemoryEvent = {
      type: "deleted",
      memoryId,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.emit(`memory:${userId}`, event);
  }
}

export const memoryEmitter = MemoryEventEmitter.getInstance();
