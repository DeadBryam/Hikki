"use client";

import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { type Control, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/misc";

interface PasswordInputProps {
  control: Control<any>;
  disabled?: boolean;
  label?: string;
  name: string;
  placeholder?: string;
}

function PasswordInput({
  control,
  name,
  label = "Password",
  placeholder = "",
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

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
              className={cn(
                "h-14 pr-10 transition-all duration-300",
                "focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-background",
                "dark:focus:ring-red-500/40 dark:focus:ring-offset-slate-900",
                "group-focus-within:shadow-lg group-focus-within:shadow-red-500/25",
                error && "border-destructive/50 focus:ring-destructive/50"
              )}
              disabled={disabled}
              id={name}
              placeholder={placeholder}
              type={showPassword ? "text" : "password"}
              {...field}
            />
            {!disabled && (
              <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-red-500/0 via-orange-500/0 to-orange-500/0 opacity-0 blur transition-opacity duration-300 group-focus-within:opacity-15" />
            )}
            <Button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={cn(
                "absolute top-0 right-0 h-full px-3 hover:bg-transparent",
                "transition-all duration-200",
                "hover:text-red-500 dark:hover:text-red-400"
              )}
              onClick={() => setShowPassword(!showPassword)}
              size="icon"
              type="button"
              variant="ghost"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
              )}
            </Button>
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

export { PasswordInput };
export type { PasswordInputProps };
