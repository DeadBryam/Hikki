import { t } from "elysia";

/**
 * Common response schemas for API endpoints
 */
export const successResponseSchema = t.Object({
  success: t.Boolean({
    description: "Indicates if the request was successful",
  }),
  data: t.Optional(t.Any()),
  message: t.Optional(t.String()),
  timestamp: t.String({ description: "Timestamp of the response" }),
});

const validationErrorDetailSchema = t.Object({
  field: t.String({ description: "Field that caused the validation error" }),
  message: t.String({ description: "Validation error message" }),
});

export const errorResponseSchema = t.Object({
  success: t.Boolean({ description: "Indicates if the request failed" }),
  message: t.String({ description: "Error message" }),
  code: t.Optional(t.String({ description: "Error code" })),
  details: t.Optional(
    t.Array(t.Union([t.String(), validationErrorDetailSchema]))
  ),
  timestamp: t.String({ description: "Timestamp of the response" }),
});

export const errorSchemas = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  403: errorResponseSchema,
  404: errorResponseSchema,
  409: errorResponseSchema,
  422: errorResponseSchema,
  500: errorResponseSchema,
};

/**
 * Creates a complete response schema for an endpoint
 */
export function createResponseSchema<TData = undefined>(
  successSchema: TData extends undefined
    ? typeof successResponseSchema
    : ReturnType<typeof t.Object>
) {
  return {
    200: successSchema,
    ...errorSchemas,
  };
}

/**
 * Creates a success response schema with data
 */
export function createDataResponseSchema(
  dataSchema: ReturnType<typeof t.Object> | ReturnType<typeof t.Array> | any
) {
  return t.Object({
    success: t.Boolean({
      description: "Indicates if the request was successful",
    }),
    data: dataSchema,
    message: t.Optional(t.String({ description: "Success message" })),
    timestamp: t.String({ description: "Timestamp of the response" }),
  });
}

/**
 * Creates a simple success response schema (no data)
 */
export const simpleSuccessResponseSchema = t.Object({
  success: t.Boolean({
    description: "Indicates if the request was successful",
  }),
  message: t.Optional(t.String({ description: "Success message" })),
  timestamp: t.String({ description: "Timestamp of the response" }),
});
