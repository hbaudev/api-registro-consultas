import type { CrearFilialInput, EditarFilialInput } from "./filiales.types.ts";
import {
  asRecord,
  parsePositiveInteger,
  parseRequiredText,
  type ValidationRecord,
} from "../../utils/global-validations.ts";

export function parseCrearFilialInput(body: unknown): CrearFilialInput | undefined {
  const record = asRecord(body);
  if (!record) return undefined;

  const codigoFilial = parseRequiredText(record.codigoFilial, 20);
  const nombreFilial = parseRequiredText(record.nombreFilial, 50);
  if (codigoFilial === undefined || nombreFilial === undefined) return undefined;

  return { codigoFilial, nombreFilial };
}

export function parseEditarFilialInput(
  params: ValidationRecord,
  body: unknown,
): EditarFilialInput | undefined {
  const filialId = parseFilialId(params.id);
  const input = parseCrearFilialInput(body);
  if (filialId === undefined || !input) return undefined;
  return { filialId, ...input };
}

export function parseFilialId(value: unknown): number | undefined {
  const id = parsePositiveInteger(value, 0);
  return id !== undefined && id > 0 ? id : undefined;
}
