"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { type ITooltip, Tooltip as ReactTooltip } from "react-tooltip";
import { cn } from "@/lib/utils/misc";

interface TooltipProps extends ITooltip {
  className?: string;
}

export function Tooltip({ className, ...props }: TooltipProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <ReactTooltip
      className={cn(
        "border! z-9999! rounded-lg! border-border/50! bg-popover! px-3! py-1! text-popover-foreground! text-sm! shadow-lg!",
        className
      )}
      classNameArrow="border! border-t-0! border-l-0! border-border/50! bg-popover!"
      positionStrategy="fixed"
      {...props}
    />,
    document.body
  );
}
