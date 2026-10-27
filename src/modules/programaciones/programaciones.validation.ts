import {
  asRecord,
  parseOptionalText,
  parsePagination,
  parseRequiredText,
} from "../../utils/global-validations.ts";
import type {
  AnularProgramacionInput,
  CrearProgramacionInput,
  ProgramacionQuery,
} from "./programaciones.types.ts";

function parseDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return undefined;
  return value;
}

export function parseListarProgramacionesQuery(value: unknown): ProgramacionQuery | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  let fecha: string | null = null;
  if (record.fecha !== undefined) {
    const parsedDate = parseDate(record.fecha);
    if (parsedDate === undefined) return undefined;
    fecha = parsedDate;
  }

  const codigoMinsa = parseOptionalText(record.codigoMinsa, 20);
  const numeroConsultorio = parseOptionalText(record.numeroConsultorio, 20);
  const paginacion = parsePagination(record);
  if (
    codigoMinsa === undefined ||
    numeroConsultorio === undefined ||
    !paginacion
  ) return undefined;

  return { fecha, codigoMinsa, numeroConsultorio, ...paginacion };
}

export function parseCrearProgramacionInput(value: unknown): CrearProgramacionInput | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const fecha = parseDate(record.fecha);
  const jornada = typeof record.jornada === "string" ? record.jornada.trim().toUpperCase() : "";
  const limitePacientes = record.limitePacientes;
  const codigoMinsaMedico = parseRequiredText(record.codigoMinsaMedico, 20);
  const numeroConsultorio = parseRequiredText(record.numeroConsultorio, 20);

  if (
    fecha === undefined ||
    (jornada !== "AM" && jornada !== "PM") ||
    typeof limitePacientes !== "number" ||
    !Number.isInteger(limitePacientes) ||
    limitePacientes < 1 ||
    limitePacientes > 60 ||
    codigoMinsaMedico === undefined ||
    numeroConsultorio === undefined
  ) return undefined;

  return {
    fecha,
    jornada,
    limitePacientes,
    codigoMinsaMedico,
    numeroConsultorio,
  };
}

export function parseAnularProgramacionInput(
  codigoProgramacion: unknown,
  value: unknown,
): AnularProgramacionInput | undefined {
  const record = asRecord(value);
  if (
    typeof codigoProgramacion !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codigoProgramacion) ||
    !record
  ) return undefined;

  const motivoAnulacion = parseRequiredText(record.motivoAnulacion, 255);
  if (!motivoAnulacion) return undefined;
  return { codigoProgramacion, motivoAnulacion };
}
