"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_LENGTH_PATTERN = /.{8,}/;
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const NUMBER_PATTERN = /\d/;
const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

interface PasswordStrengthProps {
  password: string;
  showLabel?: boolean;
}

function PasswordStrength({
  password,
  showLabel = true,
}: PasswordStrengthProps) {
  const requirements = [
    { regex: MIN_LENGTH_PATTERN, label: "At least 8 characters" },
    { regex: UPPERCASE_PATTERN, label: "1 uppercase letter" },
    { regex: LOWERCASE_PATTERN, label: "1 lowercase letter" },
    { regex: NUMBER_PATTERN, label: "1 number" },
    { regex: SPECIAL_CHAR_PATTERN, label: "1 special character" },
  ];

  const met = requirements.filter((req) => req.regex.test(password));
  const strength = met.length;

  const getStrengthLabel = () => {
    switch (strength) {
      case 0:
      case 1:
      case 2:
        return "Very Weak";
      case 3:
        return "Weak";
      case 4:
        return "Fair";
      case 5:
        return "Strong";
      default:
        return "Unknown";
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 0:
      case 1:
      case 2:
        return "text-destructive";
      case 3:
        return "text-orange-600 dark:text-orange-500";
      case 4:
        return "text-yellow-600 dark:text-yellow-500";
      case 5:
        return "text-green-600 dark:text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStrengthBarColor = () => {
    switch (strength) {
      case 0:
      case 1:
      case 2:
        return "bg-destructive";
      case 3:
        return "bg-orange-600 dark:bg-orange-500";
      case 4:
        return "bg-yellow-600 dark:bg-yellow-500";
      case 5:
        return "bg-green-600 dark:bg-green-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, height: "auto" }}
      className="fade-in animate-in space-y-3 duration-500"
      exit={{ opacity: 0, height: 0 }}
      initial={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.1, type: "spring" }}
    >
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Password Strength</span>
          <span
            className={cn(
              "font-medium text-sm transition-colors duration-300",
              getStrengthColor()
            )}
          >
            {getStrengthLabel()}
          </span>
        </div>
      )}

      {password && (
        <div className="h-2 overflow-hidden rounded-full bg-muted/20">
          <motion.div
            animate={{ width: `${(strength / 5) * 100}%` }}
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              getStrengthBarColor()
            )}
            initial={{ width: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
          />
        </div>
      )}

      <div className="space-y-1.5">
        {requirements.map((req, idx) => {
          const isMet = req.regex.test(password);
          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, y: -6 }}
              key={req.label}
              transition={{
                delay: idx * 0.05,
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
            >
              {isMet ? (
                <motion.div
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex h-4 w-4 shrink-0 items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <CheckCircle2 className="h-4 w-4 animate-success-bounce text-green-600 dark:text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="h-4 w-4 shrink-0 rounded-full bg-muted-foreground/30"
                  initial={{ opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                />
              )}
              <span
                className={cn(
                  "transition-colors duration-300",
                  isMet
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {req.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export { PasswordStrength };
export type { PasswordStrengthProps };
