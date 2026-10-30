import type { PacienteQuery, PacienteCompletoQuery } from "./pacientes.types.ts";
import {
  asRecord,
  parseDigits,
  parseOptionalText,
  parsePagination,
  parsePositiveInteger,
} from "../../utils/global-validations.ts";

export function parseListarPacientesQuery(value: unknown): PacienteQuery | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const busqueda = parseOptionalText(record.busqueda, 100);
  const tipoSeguroId = parsePositiveInteger(record.tipoSeguroId, 0);
  const paginacion = parsePagination(record);
  if (busqueda === undefined || tipoSeguroId === undefined || !paginacion) return undefined;

  return {
    busqueda,
    tipoSeguroId: record.tipoSeguroId === undefined ? null : tipoSeguroId,
    ...paginacion,
  };
}

export function parsePacienteCompletoQuery(value: unknown): PacienteCompletoQuery | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const numeroInss = parseNumeroInss(record.numeroInss);
  if (numeroInss === undefined) return undefined;

  return {
    numeroInss,
  };
}

export function parseNumeroInss(value: unknown): number | undefined {
  const digits = parseDigits(value, 1, 10);
  if (digits === undefined) return undefined;
  const numeroInss = Number(digits);
  if (!Number.isSafeInteger(numeroInss) || numeroInss < 1 || numeroInss > 2_147_483_647) {
    return undefined;
  }

  return numeroInss;
}
