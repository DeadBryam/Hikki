import { toast } from "@/lib/utils/toast";
import type { ApiError } from "@/types/api";

interface DisplayErrorOptions {
  type: "warning" | "error" | "info";
}

/**
 * Map server validation `details` to react-hook-form field errors.
 * Returns true if any field errors were set, false otherwise.
 */
export function displayErrorsFromServer(
  error: ApiError,
  options: DisplayErrorOptions
): void {
  if (options.type === "error") {
    toast.error({
      description: error.message || "An error occurred. Please try again.",
      title: "Error",
    });
  } else if (options.type === "warning") {
    toast.warning({
      description: error.message || "Please check the form for warnings.",
      title: "Warning",
    });
  } else if (options.type === "info") {
    toast.info({
      description: error.message || "Please check the form for information.",
      title: "Info",
    });
  }
}

export default displayErrorsFromServer;
