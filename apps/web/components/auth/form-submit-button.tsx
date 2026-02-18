import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormSubmitButtonProps {
  children: string;
  className?: string;
  disabled?: boolean;
  isLoading: boolean;
}

function FormSubmitButton({
  isLoading,
  children,
  disabled = false,
  className,
}: FormSubmitButtonProps) {
  return (
    <Button
      aria-busy={isLoading}
      className={cn(
        "submit-btn h-12 w-full cursor-pointer rounded-lg font-semibold shadow-sm transition-colors duration-200",
        "bg-linear-to-r from-rose-700 to-rose-600 text-white",
        "hover:from-rose-800 hover:to-rose-700 active:opacity-90",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2",
        className
      )}
      disabled={isLoading || disabled}
      type="submit"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span className="sr-only">Loading...</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export { FormSubmitButton };
export type { FormSubmitButtonProps };
