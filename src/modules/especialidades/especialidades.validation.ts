import { asRecord, parseOptionalText, parsePagination } from "../../utils/global-validations.ts";
import type { EspecialidadQuery } from "./especialidades.types.ts";

export function parseListarEspecialidadesQuery(value: unknown): EspecialidadQuery | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const busqueda = parseOptionalText(record.busqueda, 100);
  const paginacion = parsePagination(record);
  if (busqueda === undefined || !paginacion) return undefined;

  return { busqueda, ...paginacion };
}
