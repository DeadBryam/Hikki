"use client";

import { motion } from "framer-motion";

export function MessageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      {/* Assistant Message Skeleton */}
      <div className="flex gap-3">
        <div className="shrink-0">
          <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-muted" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="mb-1 h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="max-w-[80%] space-y-2 rounded-2xl border border-border/50 bg-card p-4">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              className="h-4 w-full rounded bg-muted"
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              className="h-4 w-3/4 rounded bg-muted"
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.2,
              }}
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              className="h-4 w-1/2 rounded bg-muted"
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.4,
              }}
            />
          </div>
        </div>
      </div>

      {/* User Message Skeleton */}
      <div className="flex flex-row-reverse gap-3">
        <div className="shrink-0">
          <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-lg bg-muted" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="mb-1 ml-auto h-4 w-8 animate-pulse rounded bg-muted" />
          <div className="ml-auto max-w-[75%] space-y-2 rounded-2xl border border-rose-500/10 bg-gradient-to-br from-rose-500/10 to-orange-500/10 p-4">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              className="h-4 w-full rounded bg-rose-500/20"
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              className="h-4 w-2/3 rounded bg-rose-500/20"
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.3,
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-24" />
    </div>
  );
}
