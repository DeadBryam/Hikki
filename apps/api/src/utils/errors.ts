import type {
  ApiResponse,
  ErrorResponse,
  ValidationErrorDetail,
} from "@/types/api";

interface CreateErrorResponseOptions {
  code?: string;
  details?: string[] | ValidationErrorDetail[];
  requestId?: string;
}

interface CreateSuccessResponseOptions<T = undefined> {
  data?: T;
  message?: string;
}

/**
 * Custom error class for resource conflicts (e.g., duplicate username/email)
 */
export class ConflictError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "ConflictError";
    this.field = field;
  }
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  options: CreateErrorResponseOptions = {}
): ErrorResponse {
  return {
    success: false,
    message: error,
    details: options.details,
    code: options.code,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T = undefined>(
  params: CreateSuccessResponseOptions<T> = {}
): ApiResponse<T> {
  const { data, message } = params;
  const response: ApiResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
    message: message || "Request successful",
    data,
  };

  return response;
}

/**
 * Get field-specific validation error message
 */
export function getFieldSpecificMessage(
  field: string,
  originalMessage: string
): string {
  const formatFields: Record<string, string> = {
    email: "Must be a valid email address",
    thread: "Thread ID must be a valid UUID",
  };

  if (originalMessage.includes("format") && formatFields[field]) {
    return formatFields[field];
  }

  const lengthFields: Record<string, string> = {
    password: "Must be at least 8 characters long",
    question: "Question cannot be empty",
  };

  if (originalMessage.includes("length") && lengthFields[field]) {
    return lengthFields[field];
  }

  if (field === "password" && originalMessage.includes("match")) {
    return "Must contain uppercase, lowercase, number and special character";
  }

  if (field === "threadIds") {
    if (originalMessage.includes("minItems")) {
      return "At least one thread ID is required";
    }
    if (originalMessage.includes("maxItems")) {
      return "Cannot process more than 50 threads at once";
    }
    if (originalMessage.includes("format")) {
      return "All thread IDs must be valid UUIDs";
    }
  }

  if (field === "limit") {
    if (originalMessage.includes("minimum")) {
      return "Limit must be at least 1";
    }
    if (originalMessage.includes("maximum")) {
      return "Limit cannot exceed 100";
    }
  }

  if (field === "offset" && originalMessage.includes("minimum")) {
    return "Offset must be non-negative";
  }

  return originalMessage;
}
