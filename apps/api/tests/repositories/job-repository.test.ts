import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import type { JobRepository } from "@/database/repositories/job-repository";
import { createJobRepository } from "../helpers/di-factories";

describe("Job Repository", () => {
  let jobRepo: JobRepository;
  let testJobId: string;

  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;
    jobRepo = createJobRepository(db);

    const jobData = {
      type: "test_job",
      data: JSON.stringify({ message: "test data" }),
      execute_at: new Date(Date.now() - 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
      status: "pending" as const,
    };

    testJobId = jobRepo.create(jobData);
  });

  it("should create a job", () => {
    expect(testJobId).toBeDefined();
    expect(typeof testJobId).toBe("string");
  });

  it("should find pending jobs", () => {
    const pendingJobs = jobRepo.findPendingJobs();
    expect(Array.isArray(pendingJobs)).toBe(true);
    expect(pendingJobs.length).toBeGreaterThan(0);

    const testJob = pendingJobs.find((job) => job.id === testJobId);
    expect(testJob).toBeDefined();
    expect(testJob?.type).toBe("test_job");
    expect(testJob?.status).toBe("pending");
  });

  it("should update job status", () => {
    jobRepo.updateStatus(testJobId, "processing");

    const pendingJobs = jobRepo.findPendingJobs();
    const updatedJob = pendingJobs.find((job) => job.id === testJobId);
    expect(updatedJob).toBeUndefined();
  });

  it("should mark job as processing", () => {
    const newJobId = jobRepo.create({
      type: "another_test",
      data: JSON.stringify({ test: true }),
      execute_at: new Date().toISOString(),
      status: "pending",
    });

    jobRepo.markAsProcessing(newJobId);

    const pendingJobs = jobRepo.findPendingJobs();
    const processingJob = pendingJobs.find((job) => job.id === newJobId);
    expect(processingJob).toBeUndefined();
  });

  it("should mark job as completed", () => {
    jobRepo.markAsCompleted(testJobId);

    const pendingJobs = jobRepo.findPendingJobs();
    const completedJob = pendingJobs.find((job) => job.id === testJobId);
    expect(completedJob).toBeUndefined();
  });

  it("should create a recurrent job", () => {
    const recurrentJobId = jobRepo.create({
      type: "recurrent_test",
      data: JSON.stringify({ test: "recurrent" }),
      execute_at: new Date().toISOString(),
      status: "pending",
      recurrent: true,
      interval_ms: 3_600_000,
      max_runs: 5,
      current_runs: 0,
    });

    const allJobs = jobRepo.findAllJobs();
    const recurrentJob = allJobs.find((job) => job.id === recurrentJobId);
    expect(recurrentJob).toBeDefined();
    expect(recurrentJob?.recurrent).toBe(true);
    expect(recurrentJob?.interval_ms).toBe(3_600_000);
    expect(recurrentJob?.max_runs).toBe(5);
    expect(recurrentJob?.current_runs).toBe(0);
  });

  it("should increment current runs", () => {
    const incrementJobId = jobRepo.create({
      type: "increment_test",
      data: JSON.stringify({}),
      execute_at: new Date().toISOString(),
      status: "pending",
      recurrent: true,
      interval_ms: 1000,
      max_runs: null,
      current_runs: 0,
    });

    jobRepo.incrementCurrentRuns(incrementJobId);

    const allJobs = jobRepo.findAllJobs();
    const incrementedJob = allJobs.find((job) => job.id === incrementJobId);
    expect(incrementedJob?.current_runs).toBe(1);
  });
});
