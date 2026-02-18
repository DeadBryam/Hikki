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
        "submit-btn h-12 w-full font-semibold transition-colors duration-200",
        "bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90",
        "active:opacity-75",
        className
      )}
      disabled={isLoading || disabled}
      type="submit"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
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
