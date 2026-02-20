import { env } from "@/config/env";
import { logger } from "@/config/logger";
import type { MessageRepository } from "@/database/repositories/message-repository";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type JobService from "@/services/job-service";
import type { Message } from "@/types/llm";
import type { Thread } from "@/types/thread";

export interface GetThreadsParams {
  archived?: boolean;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
  search?: string;
  sortBy?: "created_at" | "updated_at" | "title";
  sortOrder?: "asc" | "desc";
  userId: string;
}

export interface PaginatedThreadsResponse {
  items: Thread[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetMessagesParams {
  limit: number;
  offset: number;
  threadId: string;
  userId: string;
}

interface ThreadServiceDeps {
  jobService: JobService;
  messageRepository: MessageRepository;
  threadRepository: ThreadRepository;
}

export default class ThreadService {
  private readonly messageRepo: MessageRepository;
  private readonly threadRepo: ThreadRepository;
  private readonly jobService: JobService;
  private readonly systemMessage: Message = {
    role: "system",
    content: `You are a helpful assistant, an expert in software development, automation, AI and all things.
    Your name es ${env.APP_NAME} and your goal is to help the user with their questions and problems.
    Always provide clear, brief and concise answers, and ask follow-up questions if you need more information to provide a better answer.
    Do not invent or expand unnecessarily unless the user explicitly asks.
      
    If the response includes code, always provide it in markdown format with the appropriate language tag. 
    For example, for JavaScript code, use \`\`\`javascript\n ... \n\`\`\`. 
    Ensure that line breaks are represented with explicit newline characters (\n) so they are preserved in the UI. 
    Do not use <br> or other HTML tags for line breaks.`,
  };

  constructor({
    messageRepository,
    threadRepository,
    jobService,
  }: ThreadServiceDeps) {
    this.messageRepo = messageRepository;
    this.threadRepo = threadRepository;
    this.jobService = jobService;
  }

  getThreadMessages(threadId: string, userId: string): Message[] {
    const { isNew } = this.threadRepo.initializeThread(threadId, userId);
    if (isNew) {
      this.jobService.scheduleTitleGeneration(threadId);
    }
    const messages = this.messageRepo.getNotSummarizedMessages(threadId);
    const msgs: Message[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    return [this.systemMessage, ...msgs];
  }

  storeUserMessageInThread(
    threadId: string,
    content: string,
    service?: string
  ): void {
    this.messageRepo.saveMessageAndUpdateCount(
      {
        thread_id: threadId,
        role: "user",
        content,
        service,
        summarized: false,
      },
      threadId
    );
    logger.info(
      `User message stored in thread ${threadId} (${content.length} chars)`
    );
  }

  storeAssistantResponseInThread(
    threadId: string,
    response: string,
    service?: string
  ): void {
    this.messageRepo.saveMessageAndUpdateCount(
      {
        thread_id: threadId,
        role: "assistant",
        content: response,
        service,
        summarized: false,
      },
      threadId
    );
    logger.info(
      `Assistant response stored in thread ${threadId} (${response.length} chars)`
    );
  }

  getThreads(params: GetThreadsParams): PaginatedThreadsResponse {
    const {
      userId,
      limit,
      offset,
      search,
      archived,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    } = params;
    logger.info(
      `Retrieving threads for user ${userId} with filters: search=${search}, archived=${archived}, dateFrom=${dateFrom}, dateTo=${dateTo}, sortBy=${sortBy}, sortOrder=${sortOrder}, limit=${limit}, offset=${offset}`
    );

    const items = this.threadRepo.getThreadsWithFilters({
      userId,
      limit,
      offset,
      search,
      archived,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    });
    const total = this.threadRepo.countThreadsWithFilters({
      userId,
      search,
      archived,
      dateFrom,
      dateTo,
    });

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  getMessages(params: GetMessagesParams): Message[] | null {
    const { threadId, userId, limit, offset } = params;

    const thread = this.threadRepo.findById(threadId);

    if (!thread) {
      return [];
    }

    if (thread.user_id !== userId) {
      logger.warn(
        `Access denied: User ${userId} attempted to access thread ${threadId}`
      );
      return null;
    }

    return this.messageRepo.getPaginatedMessages(threadId, limit, offset);
  }

  archiveConversation(conversationId: string, userId: string): boolean {
    const thread = this.threadRepo.findById(conversationId);
    if (thread === null || thread === undefined || thread.user_id !== userId) {
      logger.warn(
        `Access denied: User ${userId} attempted to archive thread ${conversationId}`
      );
      return false;
    }

    this.threadRepo.archiveThread(conversationId);
    return true;
  }

  deleteConversation(conversationId: string, userId: string): boolean {
    const thread = this.threadRepo.findById(conversationId);
    if (thread === null || thread === undefined || thread.user_id !== userId) {
      logger.warn(
        `Access denied: User ${userId} attempted to delete thread ${conversationId}`
      );
      return false;
    }

    this.threadRepo.archiveThread(conversationId);
    return true;
  }

  createThread(userId: string, title?: string): Thread {
    const id = crypto.randomUUID();
    const threadTitle = title || `Chat ${id.slice(0, 8)}`;

    this.threadRepo.create({
      id,
      user_id: userId,
      title: threadTitle,
      message_count: 0,
    });

    logger.info(`Thread ${id} created for user ${userId}`);
    return {
      id,
      user_id: userId,
      title: threadTitle,
      message_count: 0,
      created_at: null,
      updated_at: null,
      deleted_at: null,
    };
  }
}
