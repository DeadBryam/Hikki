/*******************************
 * Animation Utilities - Hikki
 *******************************/

import type { Variants } from "framer-motion";

// Spring configurations
export const springs = {
  smooth: { type: "spring", stiffness: 300, damping: 30 },
  bouncy: { type: "spring", stiffness: 400, damping: 25 },
  gentle: { type: "spring", stiffness: 200, damping: 20 },
  stiff: { type: "spring", stiffness: 500, damping: 30 },
} as const;

// Fade variants
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// Scale variants
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Slide up variants
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

// Slide from left variants
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

// Container with stagger children
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Message variants for chat
export const messageVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

// Sidebar variants
export const sidebarVariants: Variants = {
  expanded: {
    width: 280,
    transition: { type: "spring", stiffness: 400, damping: 35 },
  },
  collapsed: {
    width: 64,
    transition: { type: "spring", stiffness: 400, damping: 35 },
  },
};

// Input focus variants
export const inputFocusVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: "0 0 0 rgba(139, 92, 246, 0)",
  },
  focus: {
    scale: 1.02,
    boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)",
    transition: springs.bouncy,
  },
};

// Glow hover variants
export const glowHoverVariants: Variants = {
  rest: {
    boxShadow: "0 0 0 rgba(139, 92, 246, 0)",
    transition: { duration: 0.3 },
  },
  hover: {
    boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
    transition: { duration: 0.3 },
  },
};

// Typing indicator variants
export const typingDotVariants: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 0.6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

// Card hover variants
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: springs.gentle,
  },
};

// Page transition variants for View Transitions + Framer Motion
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.3 },
  },
};

// List item variants
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.smooth,
  },
};

// Container variants for staggered children animations
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Item variants for use with containerVariants
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
};

// Modal overlay variants
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Modal content variants
export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Gradient background animation
export const gradientShiftVariants: Variants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 8,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
};
