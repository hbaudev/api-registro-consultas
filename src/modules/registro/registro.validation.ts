import {
  asRecord,
  parseDigits,
  parseOptionalText,
  parsePagination,
  parseRequiredText,
} from "../../utils/global-validations.ts";
import type { CrearConsultaInput, RegistroConsultaQuery } from "./registro.types.ts";

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

export function parseRegistroConsultaQuery(value: unknown): RegistroConsultaQuery | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const fechaInput = parseOptionalText(record.fecha, 10);
  if (fechaInput === undefined) return undefined;
  const fecha = fechaInput === null ? null : parseDate(fechaInput);
  if (fecha === undefined) return undefined;
  const numeroInssInput = record.numeroInss;
  let numeroInss: number | null = null;
  if (numeroInssInput !== undefined && numeroInssInput !== "") {
    const digits = parseDigits(numeroInssInput, 1, 10);
    if (digits === undefined) return undefined;
    numeroInss = Number(digits);
    if (!Number.isSafeInteger(numeroInss) || numeroInss < 1 || numeroInss > 2_147_483_647) return undefined;
  }
  const codigoConsultorio = parseOptionalText(record.codigoConsultorio, 20);
  const paginacion = parsePagination(record);
  if (codigoConsultorio === undefined || !paginacion) return undefined;

  return { fecha, numeroInss, codigoConsultorio, ...paginacion };
}

export function parseNumeroInss(value: unknown): string | undefined {
  return parseDigits(value, 1, 10);
}

export function parseCrearConsultaInput(body: unknown): CrearConsultaInput | undefined {
  const record = asRecord(body);
  if (!record) return undefined;

  const codigoProgramacion = parseRequiredText(record.codigoProgramacion, 50);
  if (!codigoProgramacion) return undefined;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(codigoProgramacion)) return undefined;

  const numeroInssRaw = record.numeroInss;
  let numeroInss: number | undefined;
  if (typeof numeroInssRaw === "number" && Number.isSafeInteger(numeroInssRaw) && numeroInssRaw > 0) {
    numeroInss = numeroInssRaw;
  } else if (typeof numeroInssRaw === "string" && /^\d+$/.test(numeroInssRaw)) {
    const parsed = Number(numeroInssRaw);
    if (Number.isSafeInteger(parsed) && parsed > 0) {
      numeroInss = parsed;
    }
  }
  if (numeroInss === undefined) return undefined;

  const esCitado = Boolean(record.esCitado);
  const esTraslado = Boolean(record.esTraslado);
  const sacarExpediente = Boolean(record.sacarExpediente);
  const observaciones = parseOptionalText(record.observaciones, 500);

  return {
    codigoProgramacion,
    numeroInss,
    esCitado,
    esTraslado,
    sacarExpediente,
    observaciones,
  };
}
