import { createErrorResponse, getFieldSpecificMessage } from "../utils/errors";

export const errorHandler = ({
  code,
  error,
  set,
  logestic,
  requestId,
}: any) => {
  if (code === "VALIDATION") {
    set.status = 422;

    const validationErrors = error.all.map((e: any) => {
      const field = e.path.startsWith("/") ? e.path.slice(1) : e.path;
      const message = getFieldSpecificMessage(field, e.message);

      return {
        field,
        message,
      };
    });

    const uniqueErrors = validationErrors.filter(
      (
        error: { field: string; message: string },
        index: number,
        self: { field: string; message: string }[]
      ) =>
        index ===
        self.findIndex(
          (e: { field: string; message: string }) =>
            e.field === error.field && e.message === error.message
        )
    );

    return createErrorResponse("Validation failed", {
      code: "VALIDATION_ERROR",
      details: uniqueErrors,
    });
  }

  if (code === "NOT_FOUND") {
    set.status = 404;
    return createErrorResponse("Not found", { code: "NOT_FOUND" });
  }

  logestic.error(`[${requestId}] Error ${code}: ${error.message}`);
  return createErrorResponse("Internal server error", {
    code: "INTERNAL_ERROR",
    requestId,
  });
};
