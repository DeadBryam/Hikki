/**
 * LLM Tools - OpenAI Function Calling format definitions
 * These tools allow the LLM to interact with memory and reminder functions
 */

import type { MemoryRepository } from "@/database/repositories/memory-repository";
import type { MemoryItemSelect } from "@/database/schema";
import { memoryEmitter } from "./memory-events";
import type { ReminderService } from "./reminder-service";

/**
 * OpenAI Function Calling tool definitions for memory operations
 */
export const memoryTools = [
  {
    type: "function" as const,
    function: {
      name: "save_memory",
      description:
        "Save a new memory, fact, or information about the user. Use this when the user shares something important about themselves, their preferences, or any information they might want to remember later.",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The content of the memory to save",
          },
          type: {
            type: "string",
            enum: ["fact", "personality", "event", "other"],
            description:
              "The type of memory: 'fact' for factual information, 'personality' for traits/preferences, 'event' for things that happened, 'other' for miscellaneous",
          },
        },
        required: ["content", "type"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_memories",
      description:
        "Retrieve memories about the user. Use this when you need to recall information about the user based on their query.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Optional search query to filter memories. Leave empty to get all memories.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_memory",
      description:
        "Delete a specific memory by its ID. Use this when the user asks you to forget or remove a specific piece of information.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the memory to delete",
          },
        },
        required: ["id"],
      },
    },
  },
];

/**
 * OpenAI Function Calling tool definitions for reminder operations
 */
export const reminderTools = [
  {
    type: "function" as const,
    function: {
      name: "set_reminder",
      description:
        "Set a reminder for the user. Use this when the user wants to be reminded about something at a specific time. Supports one-time reminders or recurrent (daily/weekly/monthly) reminders.",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The reminder message - what to remind the user about",
          },
          scheduleAt: {
            type: "string",
            description:
              "When to send the reminder. ISO 8601 format (e.g., '2026-02-24T10:00:00Z') or relative like 'in 1 hour', 'tomorrow at 9am'",
          },
          type: {
            type: "string",
            enum: ["one-time", "recurrent"],
            description:
              "Type of reminder: 'one-time' for a single reminder, 'recurrent' for repeating reminders",
          },
          repeatPattern: {
            type: "string",
            enum: ["daily", "weekly", "monthly"],
            description:
              "Only for recurrent reminders: 'daily', 'weekly', or 'monthly'",
          },
          channel: {
            type: "string",
            enum: ["in-app", "email", "push", "all"],
            description:
              "How to notify: 'in-app' (app notification), 'email' (email), 'push' (push notification), 'all' (all channels)",
          },
        },
        required: ["message", "scheduleAt", "type"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_reminders",
      description:
        "Get all active reminders for the user. Use this to list what reminders are currently set.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_reminder",
      description:
        "Delete/cancel a specific reminder by its ID. Use this when the user wants to cancel a reminder.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the reminder to delete",
          },
        },
        required: ["id"],
      },
    },
  },
];

export const allTools = [...memoryTools, ...reminderTools];

export interface IMemoryService {
  deleteMemory(args: { id: string }): string;
  getMemories(args: { query?: string }): string;
  saveMemory(args: { content: string; type: string }): string;
}

export interface IReminderService {
  createReminder(args: {
    userId: string;
    message: string;
    scheduleAt: string;
    type: "one-time" | "recurrent";
    repeatPattern?: string;
    channel: "in-app" | "email" | "push" | "all";
  }): string;
  deleteReminder(args: { id: string; userId: string }): string;
  getReminders(userId: string): string;
}

export type ToolArguments = Record<string, unknown>;

/**
 * Creates a MemoryService that wraps the MemoryRepository
 * @param memoryRepository - The memory repository instance (injected)
 * @param userId - The user ID for scoping memories
 */
export function createMemoryService(
  memoryRepository: MemoryRepository,
  userId: string
): IMemoryService {
  return {
    saveMemory(args: { content: string; type: string }): string {
      const memoryId = crypto.randomUUID();
      memoryRepository.saveMemoryItem({
        userId,
        content: args.content,
        type: args.type as "fact" | "personality" | "event" | "other",
      });
      memoryEmitter.emitMemoryCreated(userId, memoryId);
      return JSON.stringify({
        success: true,
        message: `Memory saved successfully: "${args.content.substring(0, 50)}${args.content.length > 50 ? "..." : ""}"`,
      });
    },

    getMemories(args: { query?: string }): string {
      let memories: MemoryItemSelect[] = [];
      if (args.query?.trim()) {
        memories = memoryRepository.searchMemories(userId, args.query);
      } else {
        memories = memoryRepository.getMemoriesByUser(userId);
      }

      if (memories?.length === 0) {
        return JSON.stringify({
          success: true,
          memories: [],
          message: "No memories found",
        });
      }

      return JSON.stringify({
        success: true,
        memories:
          memories?.map((m) => ({
            id: m.id,
            type: m.type,
            content: m.content,
            created_at: m.created_at,
          })) ?? [],
        count: memories?.length ?? 0,
      });
    },

    deleteMemory(args: { id: string }): string {
      memoryRepository.deleteMemory(args.id, userId);
      memoryEmitter.emitMemoryDeleted(userId, args.id);
      // Soft delete always succeeds - the record is marked as deleted
      return JSON.stringify({
        success: true,
        message: "Memory deleted successfully",
      });
    },
  };
}

/**
 * Creates a ReminderService wrapper for LLM tools
 * @param reminderService - The reminder service instance
 * @param userId - The user ID for scoping reminders
 */
export function createReminderService(
  reminderService: ReminderService,
  userId: string
): IReminderService {
  return {
    createReminder(args: {
      message: string;
      scheduleAt: string;
      type: "one-time" | "recurrent";
      repeatPattern?: string;
      channel: "in-app" | "email" | "push" | "all";
    }): string {
      const reminder = reminderService.createReminder({
        userId,
        message: args.message,
        type: args.type,
        scheduleAt: args.scheduleAt,
        repeatPattern: args.repeatPattern,
        channel: args.channel || "all",
      });
      return JSON.stringify({
        success: true,
        reminderId: reminder.id,
        message: `Reminder set for ${args.scheduleAt}: "${args.message.substring(0, 50)}${args.message.length > 50 ? "..." : ""}"`,
      });
    },

    getReminders(): string {
      const reminders = reminderService.getReminders(userId);
      return JSON.stringify({
        success: true,
        reminders: reminders.map((r) => ({
          id: r.id,
          message: r.message,
          type: r.type,
          scheduleAt: r.schedule_at,
          repeatPattern: r.repeat_pattern,
          status: r.status,
        })),
        count: reminders.length,
      });
    },

    deleteReminder(args: { id: string }): string {
      reminderService.deleteReminder(args.id, userId);
      return JSON.stringify({
        success: true,
        message: "Reminder cancelled successfully",
      });
    },
  };
}

/**
 * Tool executor that handles function calling
 * Takes tool name and arguments, executes via the appropriate service
 */
export function executeTool(
  toolName: string,
  args: ToolArguments,
  memoryService: IMemoryService,
  reminderService?: IReminderService
): string {
  switch (toolName) {
    case "save_memory":
      return memoryService.saveMemory({
        content: args.content as string,
        type: args.type as string,
      });

    case "get_memories":
      return memoryService.getMemories({
        query: args.query as string | undefined,
      });

    case "delete_memory":
      return memoryService.deleteMemory({
        id: args.id as string,
      });

    case "set_reminder":
      if (!reminderService) {
        return JSON.stringify({
          success: false,
          error: "Reminder service not available",
        });
      }
      return reminderService.createReminder({
        userId: args.userId as string,
        message: args.message as string,
        scheduleAt: args.scheduleAt as string,
        type: args.type as "one-time" | "recurrent",
        repeatPattern: args.repeatPattern as string | undefined,
        channel: (args.channel as "in-app" | "email" | "push" | "all") || "all",
      });

    case "get_reminders":
      if (!reminderService) {
        return JSON.stringify({
          success: false,
          error: "Reminder service not available",
        });
      }
      return reminderService.getReminders(args.userId as string);

    case "delete_reminder":
      if (!reminderService) {
        return JSON.stringify({
          success: false,
          error: "Reminder service not available",
        });
      }
      return reminderService.deleteReminder({
        id: args.id as string,
        userId: args.userId as string,
      });

    default:
      return JSON.stringify({
        success: false,
        error: `Unknown tool: ${toolName}`,
      });
  }
}
