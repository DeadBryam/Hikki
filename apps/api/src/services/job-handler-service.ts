import { logger } from "@/config/logger";
import type { JobRepository } from "@/database/repositories/job-repository";
import type { MessageRepository } from "@/database/repositories/message-repository";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import type LLMService from "@/services/llm-service";
import { threadEmitter } from "@/services/thread-events";
import type { ReminderService } from "./reminder-service";

interface JobHandlerServiceDeps {
  jobRepository: JobRepository;
  llmService: LLMService;
  messageRepository: MessageRepository;
  reminderService: ReminderService;
  threadRepository: ThreadRepository;
  userRepository: UserRepository;
}

export default class JobHandlerService {
  private readonly jobRepository: JobRepository;
  private readonly messageRepository: MessageRepository;
  private readonly threadRepository: ThreadRepository;
  private readonly llmService: LLMService;
  private readonly reminderService: ReminderService;

  constructor({
    jobRepository,
    messageRepository,
    threadRepository,
    llmService,
    reminderService,
  }: JobHandlerServiceDeps) {
    this.jobRepository = jobRepository;
    this.messageRepository = messageRepository;
    this.threadRepository = threadRepository;
    this.llmService = llmService;
    this.reminderService = reminderService;
  }

  async handleGenerateTitle(data: {
    threadId: string;
    jobId: string;
  }): Promise<void> {
    const { threadId, jobId } = data;
    const messages = this.messageRepository.getAllMessages(threadId);

    if (messages.length > 0) {
      const firstMessage = messages[0].content;
      const { title, serviceUsed } =
        await this.llmService.generateTitleWithAI(firstMessage);
      this.threadRepository.updateTitle(threadId, title);
      this.jobRepository.updateJobService(jobId, serviceUsed);

      // Get thread to get userId for SSE event
      const thread = this.threadRepository.findById(threadId);
      if (thread?.user_id) {
        threadEmitter.emitThreadUpdated(thread.user_id, threadId);
      }

      logger.info(
        `Title generated for thread ${threadId} using ${serviceUsed}`
      );
    }
  }

  async handleReminder(data: {
    reminderId: string;
    jobId: string;
  }): Promise<void> {
    const { reminderId, jobId } = data;
    await this.reminderService.triggerReminder(reminderId);
    this.jobRepository.updateJobService(jobId, "reminder");
    logger.info(`Reminder ${reminderId} triggered via job ${jobId}`);
  }
}
