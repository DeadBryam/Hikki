/**
 * LLM Tools - OpenAI Function Calling format definitions
 * These tools allow the LLM to interact with memory functions
 */

import type { MemoryRepository } from "@/database/repositories/memory-repository";
import type { MemoryItemSelect } from "@/database/schema";
import { memoryEmitter } from "./memory-events";

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

export interface IMemoryService {
  deleteMemory(args: { id: string }): string;
  getMemories(args: { query?: string }): string;
  saveMemory(args: { content: string; type: string }): string;
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
 * Tool executor that handles function calling
 * Takes tool name and arguments, executes via the appropriate service
 */
export function executeTool(
  toolName: string,
  args: ToolArguments,
  memoryService: IMemoryService
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

    default:
      return JSON.stringify({
        success: false,
        error: `Unknown tool: ${toolName}`,
      });
  }
}
