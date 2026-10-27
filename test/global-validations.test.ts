import assert from "node:assert/strict";
import test from "node:test";
import {
  asRecord,
  parseDigits,
  parseOptionalBoolean,
  parseOptionalText,
  parsePagination,
  parsePositiveInteger,
  parseRequiredText,
} from "../src/utils/global-validations.ts";

test("shared record validator rejects non-record values", () => {
  assert.deepEqual(asRecord({ value: 1 }), { value: 1 });
  assert.equal(asRecord(null), undefined);
  assert.equal(asRecord([]), undefined);
  assert.equal(asRecord("text"), undefined);
});

test("shared pagination applies defaults and enforces bounds", () => {
  assert.deepEqual(parsePagination({}), { pagina: 1, tamanioPagina: 20 });
  assert.deepEqual(parsePagination({ pagina: "2", tamanioPagina: "50" }), {
    pagina: 2,
    tamanioPagina: 50,
  });
  assert.equal(parsePagination({ pagina: "0" }), undefined);
  assert.equal(parsePagination({ tamanioPagina: "101" }), undefined);
});

test("shared text validators trim input and enforce optional/required semantics", () => {
  assert.equal(parseOptionalText(undefined, 20), null);
  assert.equal(parseOptionalText("  ", 20), null);
  assert.equal(parseOptionalText("  value ", 20), "value");
  assert.equal(parseOptionalText("long", 3), undefined);
  assert.equal(parseRequiredText("  value ", 20), "value");
  assert.equal(parseRequiredText("  ", 20), undefined);
  assert.equal(parseRequiredText("long", 3), undefined);
});

test("shared integer, digit, and boolean validators preserve accepted formats", () => {
  assert.equal(parsePositiveInteger("42", 1, 50), 42);
  assert.equal(parsePositiveInteger("51", 1, 50), undefined);
  assert.equal(parseDigits(" 00123 ", 1, 10), "00123");
  assert.equal(parseDigits("12a", 1, 10), undefined);
  assert.equal(parseOptionalBoolean(undefined), null);
  assert.equal(parseOptionalBoolean("YES"), true);
  assert.equal(parseOptionalBoolean("0"), false);
  assert.equal(parseOptionalBoolean("maybe"), undefined);
});
