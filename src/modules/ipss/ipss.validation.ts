import { parseDigits } from "../../utils/global-validations.ts";

export function parseNumeroInss(value: unknown): string | undefined {
  return parseDigits(value, 1, 10);
}