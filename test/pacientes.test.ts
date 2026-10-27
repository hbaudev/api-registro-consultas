import assert from "node:assert/strict";
import test from "node:test";
import { parseNumeroInss } from "../src/modules/pacientes/pacientes.validation.ts";

test("INSS for expediente lookup must be a positive SQL Server INT", () => {
  assert.equal(parseNumeroInss("1234567890"), 1_234_567_890);
  assert.equal(parseNumeroInss(" 123 "), 123);
  assert.equal(parseNumeroInss("0"), undefined);
  assert.equal(parseNumeroInss("2147483648"), undefined);
  assert.equal(parseNumeroInss("12345678901"), undefined);
  assert.equal(parseNumeroInss("12.3"), undefined);
  assert.equal(parseNumeroInss("abc"), undefined);
  assert.equal(parseNumeroInss(123), undefined);
});
