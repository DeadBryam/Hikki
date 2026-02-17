"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

const Providers = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
);

export { Providers };
