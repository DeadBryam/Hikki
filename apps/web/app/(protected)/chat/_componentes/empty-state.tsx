"use client";

import { motion } from "framer-motion";
import { Code, Lightbulb, Palette, Sparkles, Zap } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/utils/animations";

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

const quickSuggestions = [
  {
    icon: Lightbulb,
    text: "Summarize my knowledge about",
    prompt: "Summarize my knowledge about",
  },
  { icon: Code, text: "Write code for", prompt: "Write code for" },
  {
    icon: Palette,
    text: "Design a system for",
    prompt: "Design a system for",
  },
  { icon: Zap, text: "Analyze and optimize", prompt: "Analyze and optimize" },
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <motion.div
        animate="visible"
        className="mx-auto max-w-2xl text-center"
        initial="hidden"
        variants={containerVariants}
      >
        {/* Logo Animation */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="relative mx-auto h-24 w-24">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600"
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 shadow-lg shadow-red-500/30">
              <Sparkles className="h-12 w-12 bg-clip-text text-white" />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-2 rounded-2xl bg-red-500/20 blur-xl" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="mb-4 font-bold text-4xl text-white tracking-tight sm:text-5xl"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-red-400 via-orange-400 to-orange-400 bg-clip-text text-transparent">
            Hikki AI
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mb-12 text-lg text-white/60"
          variants={itemVariants}
        >
          Your intelligent assistant with persistent memory.
          <br className="hidden sm:block" />
          Ask me anything and I'll remember the context.
        </motion.p>

        {/* Quick Suggestions Grid */}
        <motion.div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          variants={itemVariants}
        >
          {quickSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <motion.button
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10"
                key={suggestion.text}
                onClick={() => onSuggestionClick(suggestion.prompt)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-5 w-5 text-red-400 transition-colors group-hover:text-red-300" />
                <span className="text-sm text-white/80 group-hover:text-white">
                  {suggestion.text}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Footer hint */}
        <motion.p
          className="mt-12 text-sm text-white/40"
          variants={itemVariants}
        >
          Press{" "}
          <kbd className="rounded bg-white/10 px-2 py-1 font-mono text-white/60 text-xs">
            /
          </kbd>{" "}
          to focus the input
        </motion.p>
      </motion.div>
    </div>
  );
}
