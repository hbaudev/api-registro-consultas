import { asRecord, parseDigits, parseOptionalText, parseRequiredText } from "../../utils/global-validations.ts";
import type { CrearConsultaInput } from "./registro.types.ts";

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
