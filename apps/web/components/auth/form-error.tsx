import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  className?: string;
  message: string;
  onDismiss?: () => void;
}

function FormError({ message, className, onDismiss }: FormErrorProps) {
  return (
    <div
      className={cn(
        "fade-in slide-in-from-top animate-in items-start gap-3 rounded-lg border border-destructive/30",
        "bg-destructive/5 px-4 py-3 backdrop-blur-sm duration-300",
        "dark:border-destructive/40 dark:bg-destructive/10",
        "shadow-destructive/10 shadow-lg dark:shadow-destructive/20",
        "animate-bounce-in",
        "flex",
        className
      )}
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-destructive" />
      <div className="flex flex-1 items-center justify-between gap-2">
        <p className="font-medium text-destructive text-sm">{message}</p>
        {onDismiss && (
          <button
            className={cn(
              "text-destructive/70 transition-all duration-200",
              "hover:scale-110 hover:text-destructive"
            )}
            onClick={onDismiss}
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export { FormError };
export type { FormErrorProps };
