"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, Play } from "lucide-react";
import { cardHoverVariants } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/misc";

interface Job {
  description: string;
  id: string;
  name: string;
  schedule: string;
  status: "running" | "failed" | "pending" | "completed";
}

interface JobsTabProps {
  jobs: Job[];
}

export function JobsTab({ jobs }: JobsTabProps) {
  if (jobs.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>No jobs running</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <motion.div
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-xl border bg-card p-3",
            job.status === "running" && "border-cyan-500/30",
            job.status === "failed" && "border-rose-500/30",
            job.status === "pending" && "border-border/50",
            job.status === "completed" && "border-green-500/30"
          )}
          initial="rest"
          key={job.id}
          variants={cardHoverVariants}
          whileHover="hover"
        >
          <div className="mb-1 flex items-start justify-between">
            <h4 className="font-medium text-sm">{job.name}</h4>
            <StatusIcon status={job.status} />
          </div>
          <p className="mb-2 text-muted-foreground text-xs">
            {job.description}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-muted-foreground">
              {job.schedule}
            </span>
            <span
              className={cn(
                job.status === "running" && "text-cyan-400",
                job.status === "failed" && "text-rose-400"
              )}
            >
              {job.status === "running" ? "Running" : "---"}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "running":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
          <Play className="h-3 w-3 fill-cyan-400 text-cyan-400" />
        </div>
      );
    case "failed":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20">
          <AlertCircle className="h-3 w-3 text-rose-400" />
        </div>
      );
    case "completed":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle2 className="h-3 w-3 text-green-400" />
        </div>
      );
    default:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
          <Clock className="h-3 w-3 text-muted-foreground" />
        </div>
      );
  }
}
