export class ProgramacionRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ProgramacionRequestError";
  }
}

const procedureErrors: Record<number, { status: number; message: string }> = {
  50001: { status: 400, message: "La fecha de programación no puede estar en el pasado." },
  50002: { status: 400, message: "La jornada debe ser AM o PM." },
  50003: { status: 400, message: "El límite de pacientes debe estar entre 1 y 60." },
  50004: { status: 400, message: "El código MINSA del médico es obligatorio." },
  50005: { status: 400, message: "El número de consultorio es obligatorio." },
  50006: { status: 401, message: "No se encontró el usuario activo de la sesión." },
  50007: { status: 401, message: "No se encontró el usuario activo de la sesión." },
  50008: { status: 403, message: "Solo Administrador o Admisionista puede crear programaciones." },
  50009: { status: 404, message: "No existe un médico activo con el código MINSA indicado." },
  50010: { status: 404, message: "No existe un consultorio disponible con el número indicado." },
  50011: { status: 409, message: "El médico ya tiene una programación activa en esa fecha y jornada." },
  50012: { status: 409, message: "El consultorio ya tiene una programación activa en esa fecha y jornada." },
  50013: { status: 409, message: "El médico o el consultorio ya tiene una programación activa en esa fecha y jornada." },
  50101: { status: 400, message: "El motivo de anulación es obligatorio." },
  50102: { status: 401, message: "No se encontró el usuario activo de la sesión." },
  50103: { status: 403, message: "Solo Administrador o Admisionista puede anular programaciones." },
  50104: { status: 404, message: "No existe una programación activa con ese código." },
};

export function mapProgramacionProcedureError(error: unknown): ProgramacionRequestError | undefined {
  const messages: string[] = [];
  if (error instanceof Error) messages.push(error.message);
  if (typeof error === "object" && error !== null && "odbcErrors" in error) {
    const diagnostics = error.odbcErrors;
    if (Array.isArray(diagnostics)) {
      for (const diagnostic of diagnostics) {
        if (typeof diagnostic === "object" && diagnostic !== null && "message" in diagnostic) {
          messages.push(String(diagnostic.message));
        }
        if (typeof diagnostic === "object" && diagnostic !== null && "code" in diagnostic) {
          messages.push(String(diagnostic.code));
        }
      }
    }
  }

  for (const message of messages) {
    const match = message.match(/\b(500(?:0[1-9]|1[0-3])|5010[1-4])\b/);
    if (match) {
      const mapped = procedureErrors[Number(match[1])];
      return new ProgramacionRequestError(mapped.message, mapped.status);
    }
  }
  return undefined;
}
