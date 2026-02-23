import type { MemoryRepository } from "@/database/repositories/memory-repository";
import type { MemoryItemSelect } from "@/database/schema";
import { memoryEmitter } from "./memory-events";

interface MemoryServiceDeps {
  memoryRepository: MemoryRepository;
}

export class MemoryService {
  private readonly memoryRepository: MemoryRepository;

  constructor({ memoryRepository }: MemoryServiceDeps) {
    this.memoryRepository = memoryRepository;
  }

  createMemory(
    userId: string,
    content: string,
    type: "fact" | "personality" | "event" | "other",
    threadId?: string
  ): MemoryItemSelect {
    this.memoryRepository.saveMemoryItem({
      userId,
      content,
      type,
      thread_id: threadId,
    });

    // Get the created memory - we need to fetch it since insert doesn't return
    const memories = this.memoryRepository.getMemoryByType(
      userId,
      threadId,
      type
    );
    const created = memories[0];
    if (!created) {
      throw new Error("Failed to create memory");
    }

    // Emit SSE event
    memoryEmitter.emitMemoryCreated(userId, created.id);

    return created;
  }

  getMemories(userId: string, searchQuery?: string): MemoryItemSelect[] {
    if (searchQuery && searchQuery.trim().length > 0) {
      return this.memoryRepository.searchMemories(userId, searchQuery);
    }
    return this.memoryRepository.getMemoriesByUser(userId);
  }

  deleteMemory(id: string, userId: string): boolean {
    // First check if memory exists and belongs to user
    const memories = this.memoryRepository.getMemoryByType(userId);
    const memory = memories.find((m) => m.id === id);

    if (!memory) {
      return false;
    }

    this.memoryRepository.deleteMemory(id, userId);

    // Emit SSE event
    memoryEmitter.emitMemoryDeleted(userId, id);

    return true;
  }
}
