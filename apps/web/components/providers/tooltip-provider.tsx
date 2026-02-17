"use client";

import { TooltipProvider as RadixTooltipProvider } from "@radix-ui/react-tooltip";

const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <RadixTooltipProvider delayDuration={100}>{children}</RadixTooltipProvider>
);

export { TooltipProvider };
