export class RegistroRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "RegistroRequestError";
  }
}

const procedureStatusMap: Record<number, number> = {
  50030: 400, // Código programación obligatorio
  50031: 401, // Usuario de admisión obligatorio
  50032: 400, // Número INSS obligatorio
  50033: 401, // Usuario de admisión no existe o inactivo
  50034: 403, // Usuario sin filial asignada
  50035: 404, // Paciente no encontrado
  50036: 404, // Programación no encontrada o anulada
  50037: 400, // Programación con fecha pasada
  50038: 409, // Paciente duplicado en la misma programación
  50039: 409, // Límite máximo de cupos alcanzado
};

export function mapRegistroProcedureError(error: unknown): RegistroRequestError | undefined {
  if (typeof error === "object" && error !== null && "odbcErrors" in error) {
    const diagnostics = (error as { odbcErrors: unknown[] }).odbcErrors;
    if (Array.isArray(diagnostics)) {
      for (const diag of diagnostics) {
        if (typeof diag === "object" && diag !== null) {
          const code = Number((diag as { code?: unknown }).code);
          const rawMessage = String((diag as { message?: unknown }).message ?? "");

          // 1. Verificar si el código devuelto por SQL Server THROW (50030-50039) está en el mapa
          if (procedureStatusMap[code] !== undefined) {
            const status = procedureStatusMap[code];
            // Eliminar prefijos de ODBC como "[Microsoft][ODBC Driver 18 for SQL Server][SQL Server]"
            const cleanMessage = rawMessage.replace(/^(\[[^\]]+\]\s*)+/g, "").trim();
            return new RegistroRequestError(cleanMessage || "Error en el registro de consulta.", status);
          }

          // 2. O si el texto del mensaje contiene el número de error
          const match = rawMessage.match(/\b(5003[0-9])\b/);
          if (match) {
            const matchedCode = Number(match[1]);
            const status = procedureStatusMap[matchedCode] ?? 400;
            const cleanMessage = rawMessage.replace(/^(\[[^\]]+\]\s*)+/g, "").trim();
            return new RegistroRequestError(cleanMessage || "Error en el registro de consulta.", status);
          }
        }
      }
    }
  }

  // Fallback si el error viene en error.message
  if (error instanceof Error) {
    const match = error.message.match(/\b(5003[0-9])\b/);
    if (match) {
      const code = Number(match[1]);
      const status = procedureStatusMap[code] ?? 400;
      const cleanMessage = error.message.replace(/^(\[[^\]]+\]\s*)+/g, "").trim();
      return new RegistroRequestError(cleanMessage || "Error al registrar la consulta.", status);
    }
  }

  return undefined;
}
