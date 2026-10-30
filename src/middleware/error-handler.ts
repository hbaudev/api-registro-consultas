import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  const status = getHttpStatus(error);
  if (status >= 500) {
    const details = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { name: "UnknownError", message: String(error) };
    const odbcErrors = getOdbcErrors(error);
    console.error("Error interno de la API.", { ...details, ...(odbcErrors ? { odbcErrors } : {}) });
  }

  const clientMessage =
    status < 500 && error instanceof Error && error.message
      ? error.message
      : status >= 500
        ? "Ocurrió un error interno."
        : "Solicitud inválida.";

  response.status(status).json({
    error: clientMessage,
  });
};

function getOdbcErrors(error: unknown): Array<{ message: string; code: number; state: string }> | undefined {
  if (typeof error !== "object" || error === null || !("odbcErrors" in error)) return undefined;
  const errors = error.odbcErrors;
  if (!Array.isArray(errors)) return undefined;

  return errors.map((item) => ({
    message: String(item.message ?? ""),
    code: Number(item.code),
    state: String(item.state ?? ""),
  }));
}

function getHttpStatus(error: unknown): number {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return error.status;
  }
  return 500;
}
