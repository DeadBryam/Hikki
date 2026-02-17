import { logger } from "@/config/logger";
import type { JobRepository } from "@/database/repositories/job-repository";
import type { MessageRepository } from "@/database/repositories/message-repository";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type LLMService from "@/services/llm-service";

interface JobHandlerServiceDeps {
  jobRepository: JobRepository;
  llmService: LLMService;
  messageRepository: MessageRepository;
  threadRepository: ThreadRepository;
}

export default class JobHandlerService {
  private readonly jobRepository: JobRepository;
  private readonly messageRepository: MessageRepository;
  private readonly threadRepository: ThreadRepository;
  private readonly llmService: LLMService;

  constructor({
    jobRepository,
    messageRepository,
    threadRepository,
    llmService,
  }: JobHandlerServiceDeps) {
    this.jobRepository = jobRepository;
    this.messageRepository = messageRepository;
    this.threadRepository = threadRepository;
    this.llmService = llmService;
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
      logger.info(
        `Title generated for thread ${threadId} using ${serviceUsed}`
      );
    }
  }
}
