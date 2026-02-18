import type { FieldValues, UseFormSetError } from "react-hook-form";
import { toast } from "@/lib/utils/toast";
import type { ApiError } from "@/types/api";

/**
 * Map server validation `details` to react-hook-form field errors.
 * Returns true if any field errors were set, false otherwise.
 */
export function setFormErrorsFromServer<T extends FieldValues = FieldValues>(
  setError: UseFormSetError<T>,
  error: ApiError
): void {
  const details = error.details || [];

  if (details) {
    for (const d of details) {
      if (!d?.field) {
        continue;
      }
      setError(d.field as any, {
        type: "server",
        message: d.message ?? "Invalid value",
      });
    }
  }

  toast.error({
    description: error.message || "Please check the form for errors.",
    title: "Submission failed",
  });
}

export default setFormErrorsFromServer;
