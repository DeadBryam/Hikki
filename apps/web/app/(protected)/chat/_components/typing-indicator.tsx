"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
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
  );
}
