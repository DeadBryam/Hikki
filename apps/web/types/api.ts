/**
 * Generic API response type that follows a consistent standard
 */
export interface ApiResponse<T = undefined> {
  data?: T;
  details?: string[];
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * Validation error detail with field information
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Standard error response type
 */
export interface ErrorResponse<T = undefined> {
  code?: string;
  data?: T;
  details?: string[] | ValidationErrorDetail[];
  message: string;
  requestId?: string;
  success: false;
  timestamp: string;
}

/**
 * Simplified error type for client-side handling
 */
export interface ApiError {
  code?: string;
  details?: Record<string, string>[];
  message: string;
}
