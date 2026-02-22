import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/misc";

interface TruncatedTextProps {
  className?: string;
  maxLength?: number;
  text: string;
  tooltipId?: string;
  tooltipPlace?: "top" | "bottom" | "left" | "right";
}

export function TruncatedText({
  text,
  maxLength = 15,
  className,
  tooltipId,
  tooltipPlace = "top",
}: TruncatedTextProps) {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? `${text.slice(0, maxLength)}...` : text;

  return (
    <>
      <span
        className={cn("truncate", className)}
        data-tooltip-content={shouldTruncate ? text : undefined}
        data-tooltip-id={shouldTruncate ? tooltipId : undefined}
        data-tooltip-place={tooltipPlace}
      >
        {displayText}
      </span>
      {shouldTruncate && tooltipId && (
        <Tooltip id={tooltipId} positionStrategy="fixed" />
      )}
    </>
  );
}
