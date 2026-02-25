import { EventEmitter } from "node:events";

export interface ReminderEvent {
  reminderId: string;
  timestamp: string;
  type: "created" | "triggered" | "cancelled";
  userId: string;
}

class ReminderEventEmitter extends EventEmitter {
  private static instance: ReminderEventEmitter;

  private constructor() {
    super();
  }

  static getInstance(): ReminderEventEmitter {
    if (!ReminderEventEmitter.instance) {
      ReminderEventEmitter.instance = new ReminderEventEmitter();
    }
    return ReminderEventEmitter.instance;
  }

  emitReminderCreated(userId: string, reminderId: string) {
    const event: ReminderEvent = {
      type: "created",
      reminderId,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.emit(`reminder:${userId}`, event);
  }

  emitReminderTriggered(userId: string, reminderId: string) {
    const event: ReminderEvent = {
      type: "triggered",
      reminderId,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.emit(`reminder:${userId}`, event);
  }

  emitReminderCancelled(userId: string, reminderId: string) {
    const event: ReminderEvent = {
      type: "cancelled",
      reminderId,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.emit(`reminder:${userId}`, event);
  }
}

export const reminderEmitter = ReminderEventEmitter.getInstance();
