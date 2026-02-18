import { AlertCircle } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  control: Control<any>;
  disabled?: boolean;
  label?: string;
  name: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
}

function FormInput({
  control,
  name,
  label,
  placeholder = "",
  type = "text",
  disabled = false,
}: FormInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className="form-fields fade-in slide-in-from-bottom-2 animate-in space-y-2 duration-500">
          {label && (
            <label
              className="block font-medium text-base text-foreground"
              htmlFor={name}
            >
              {label}
            </label>
          )}
          <div className="input-focus-effect group relative">
            <Input
              aria-describedby={error ? `${name}-error` : undefined}
              aria-invalid={error ? "true" : "false"}
              disabled={disabled}
              id={name}
              placeholder={placeholder}
              type={type}
              {...field}
              className={cn(
                "h-14 transition-all duration-300",
                "focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-background",
                "dark:focus:ring-red-500/40 dark:focus:ring-offset-slate-900",
                "group-focus-within:shadow-lg group-focus-within:shadow-red-500/25",
                error && "border-destructive/50 focus:ring-destructive/50"
              )}
            />
            {!disabled && (
              <div className="pointer-events-none absolute inset-0 rounded-md bg-linear-to-r from-red-500/0 via-orange-500/0 to-orange-500/0 opacity-0 blur transition-opacity duration-300 group-focus-within:opacity-15" />
            )}
          </div>
          {error && (
            <div
              className="fade-in flex animate-in items-center gap-2 text-destructive text-sm duration-300"
              id={`${name}-error`}
            >
              <AlertCircle className="size-3 shrink-0" />
              <span>{error.message}</span>
            </div>
          )}
        </div>
      )}
    />
  );
}

export { FormInput };
export type { FormInputProps };
