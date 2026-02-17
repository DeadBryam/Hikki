"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
        <span className="font-bold text-white text-xs">H</span>
      </div>

      {/* Typing dots */}
      <div className="flex items-center gap-1 rounded-2xl border border-border/50 bg-card px-4 py-3">
        <motion.span
          animate={{
            y: [0, -6, 0],
            opacity: [1, 0.5, 1],
          }}
          className="h-2 w-2 rounded-full bg-violet-500"
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0,
          }}
        />
        <motion.span
          animate={{
            y: [0, -6, 0],
            opacity: [1, 0.5, 1],
          }}
          className="h-2 w-2 rounded-full bg-violet-500"
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.15,
          }}
        />
        <motion.span
          animate={{
            y: [0, -6, 0],
            opacity: [1, 0.5, 1],
          }}
          className="h-2 w-2 rounded-full bg-violet-500"
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
      </div>
    </div>
  );
}
