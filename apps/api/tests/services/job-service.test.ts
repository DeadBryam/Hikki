/** biome-ignore-all lint/suspicious/noEmptyBlockStatements: JUST TEST FILE */
import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import type { JobRepository } from "@/database/repositories/job-repository";
import type { MessageRepository } from "@/database/repositories/message-repository";
import type { ThreadRepository } from "@/database/repositories/thread-repository";
import type JobHandlerService from "@/services/job-handler-service";
import type JobService from "@/services/job-service";
import {
  createJobHandlerService,
  createJobRepository,
  createJobService,
  createLLMService,
  createMessageRepository,
  createSessionRepository,
  createThreadRepository,
  createVerificationTokenRepository,
} from "../helpers/di-factories";

describe("Job Service", () => {
  let jobService: JobService;
  let jobHandlerService: JobHandlerService;
  let jobRepo: JobRepository;
  let threadRepo: ThreadRepository;
  let messageRepo: MessageRepository;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;

    jobRepo = createJobRepository(db);
    const verificationTokenRepo = createVerificationTokenRepository(db);
    const sessionRepo = createSessionRepository(db);
    threadRepo = createThreadRepository(db);
    messageRepo = createMessageRepository(db, threadRepo);
    const llmService = createLLMService();
    jobHandlerService = createJobHandlerService(
      jobRepo,
      messageRepo,
      threadRepo,
      llmService
    );
    jobService = createJobService(
      jobRepo,
      jobHandlerService,
      verificationTokenRepo,
      sessionRepo
    );
  });

  it("should schedule title generation", () => {
    const threadId = `test-thread-${Date.now()}`;

    jobService.scheduleTitleGeneration(threadId);

    const allJobs = jobRepo.findAllJobs();
    const titleJob = allJobs.find((job) => {
      const data = JSON.parse(job.data);
      return data.threadId === threadId && job.type === "generate-title";
    });

    expect(titleJob).toBeDefined();
    expect(titleJob?.type).toBe("generate-title");
    expect(titleJob?.status).toBe("pending");
    const data = JSON.parse(titleJob?.data || "{}");
    expect(data.threadId).toBe(threadId);
  });

  it("should process jobs successfully", async () => {
    const threadId = `process-thread-${Date.now()}`;

    const executeAt = new Date(Date.now() - 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const jobId = jobRepo.create({
      type: "generate-title",
      status: "pending",
      data: JSON.stringify({ threadId }),
      execute_at: executeAt,
    });

    await jobService.processJobs();

    const allJobs = jobRepo.findAllJobs();
    const completedJob = allJobs.find((job) => job.id === jobId);

    expect(completedJob?.status).toBe("completed");
  });

  it("should handle job failures", async () => {
    const executeAt = new Date(Date.now() - 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const invalidJobId = jobRepo.create({
      type: "generate-title",
      data: "invalid json",
      execute_at: executeAt,
      status: "pending",
    });

    await jobService.processJobs();

    const allJobs = jobRepo.findAllJobs();
    const failedJob = allJobs.find((job) => job.id === invalidJobId);
    expect(failedJob?.status).toBe("failed");
  });

  it("should update job service", () => {
    const jobId = jobRepo.create({
      type: "generate-title",
      data: JSON.stringify({ threadId: "test-thread" }),
      execute_at: new Date().toISOString(),
      status: "pending",
    });

    jobService.updateJobService(jobId, "test-service");

    const allJobs = jobRepo.findAllJobs();
    const updatedJob = allJobs.find((job) => job.id === jobId);
    expect(updatedJob?.service).toBe("test-service");
  });

  it("should handle multiple pending jobs", async () => {
    const executeAt = new Date(Date.now() - 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const jobIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const threadId = `multi-thread-${Date.now()}-${i}`;
      const jobId = jobRepo.create({
        type: "generate-title",
        status: "pending",
        data: JSON.stringify({ threadId }),
        execute_at: executeAt,
      });
      jobIds.push(jobId);
    }

    const initialPendingCount = jobRepo.findPendingJobs().length;

    await jobService.processJobs();

    const finalPendingCount = jobRepo.findPendingJobs().length;

    expect(finalPendingCount).toBeLessThan(initialPendingCount);

    const allJobs = jobRepo.findAllJobs();
    const completedJobs = allJobs.filter(
      (job) => jobIds.includes(job.id) && job.status === "completed"
    );
    expect(completedJobs.length).toBe(3);
  });

  it("should schedule a recurrent job", () => {
    const data = { test: "recurrent data" };
    const intervalMs = 86_400_000;
    const maxRuns = 3;

    jobService.scheduleRecurrentJob(
      "test-recurrent",
      data,
      intervalMs,
      maxRuns
    );

    const allJobs = jobRepo.findAllJobs();
    const recurrentJob = allJobs.find((job) => {
      try {
        const jobData = JSON.parse(job.data);
        return (
          job.type === "test-recurrent" && jobData.test === "recurrent data"
        );
      } catch {
        return false;
      }
    });

    expect(recurrentJob).toBeDefined();
    expect(recurrentJob?.recurrent).toBe(true);
    expect(recurrentJob?.interval_ms).toBe(intervalMs);
    expect(recurrentJob?.max_runs).toBe(maxRuns);
    expect(recurrentJob?.current_runs).toBe(0);
    expect(recurrentJob?.status).toBe("pending");
  });

  it("should process recurrent job and reschedule", async () => {
    const executeAt = new Date(Date.now() - 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const recurrentJobId = jobRepo.create({
      type: "recurrent-process",
      data: JSON.stringify({ test: true }),
      execute_at: executeAt,
      status: "pending",
      recurrent: true,
      interval_ms: 1000,
      max_runs: 2,
      current_runs: 0,
    });

    const initialJobCount = jobRepo.findAllJobs().length;

    await jobService.processJobs();

    const allJobsAfter = jobRepo.findAllJobs();
    const completedJob = allJobsAfter.find((job) => job.id === recurrentJobId);
    expect(completedJob?.status).toBe("completed");
    expect(completedJob?.current_runs).toBe(1);

    expect(allJobsAfter.length).toBe(initialJobCount + 1);

    const newJob = allJobsAfter.find(
      (job) =>
        job.type === "recurrent-process" &&
        job.id !== recurrentJobId &&
        job.status === "pending"
    );
    expect(newJob).toBeDefined();
    expect(newJob?.current_runs).toBe(1);
  });

  it("should not reschedule recurrent job when max runs reached", async () => {
    const executeAt = new Date(Date.now() - 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const maxRunsJobId = jobRepo.create({
      type: "max-runs-test",
      data: JSON.stringify({ test: true }),
      execute_at: executeAt,
      status: "pending",
      recurrent: true,
      interval_ms: 1000,
      max_runs: 1,
      current_runs: 0,
    });

    const initialJobCount = jobRepo.findAllJobs().length;

    await jobService.processJobs();

    const allJobsAfter = jobRepo.findAllJobs();
    const completedJob = allJobsAfter.find((job) => job.id === maxRunsJobId);
    expect(completedJob?.status).toBe("completed");
    expect(completedJob?.current_runs).toBe(1);

    expect(allJobsAfter.length).toBe(initialJobCount);
  });

  it("should handle recurrent job with unlimited runs", async () => {
    const executeAt = new Date(Date.now() - 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const unlimitedJobId = jobRepo.create({
      type: "unlimited-test",
      data: JSON.stringify({ test: true }),
      execute_at: executeAt,
      status: "pending",
      recurrent: true,
      interval_ms: 1000,
      max_runs: null,
      current_runs: 0,
    });

    const initialJobCount = jobRepo.findAllJobs().length;

    await jobService.processJobs();

    const allJobsAfter = jobRepo.findAllJobs();
    const completedJob = allJobsAfter.find((job) => job.id === unlimitedJobId);
    expect(completedJob?.status).toBe("completed");
    expect(completedJob?.current_runs).toBe(1);

    expect(allJobsAfter.length).toBe(initialJobCount + 1);
  });
});
