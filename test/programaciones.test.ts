import assert from "node:assert/strict";
import test from "node:test";
import { mapProgramacionProcedureError } from "../src/modules/programaciones/programaciones.errors.ts";
import {
  parseAnularProgramacionInput,
  parseCrearProgramacionInput,
  parseListarProgramacionesQuery,
} from "../src/modules/programaciones/programaciones.validation.ts";

test("programación query validates date filters and pagination", () => {
  assert.deepEqual(parseListarProgramacionesQuery({ fecha: "2026-10-26", pagina: "2", tamanioPagina: "50" }), {
    fecha: "2026-10-26",
    codigoMinsa: null,
    numeroConsultorio: null,
    pagina: 2,
    tamanioPagina: 50,
  });
  assert.equal(parseListarProgramacionesQuery({ fecha: "2026-02-30" }), undefined);
  assert.equal(parseListarProgramacionesQuery({ tamanioPagina: "101" }), undefined);
});

test("programación creation validates required fields, jornada, and patient limit", () => {
  assert.deepEqual(parseCrearProgramacionInput({
    fecha: "2026-10-26",
    jornada: "am",
    limitePacientes: 60,
    codigoMinsaMedico: "MINSA-123",
    numeroConsultorio: "12",
  }), {
    fecha: "2026-10-26",
    jornada: "AM",
    limitePacientes: 60,
    codigoMinsaMedico: "MINSA-123",
    numeroConsultorio: "12",
  });
  assert.equal(parseCrearProgramacionInput({
    fecha: "2026-02-30",
    jornada: "AM",
    limitePacientes: 10,
    codigoMinsaMedico: "MINSA-123",
    numeroConsultorio: "12",
  }), undefined);
  assert.equal(parseCrearProgramacionInput({
    fecha: "2026-10-26",
    jornada: "EV",
    limitePacientes: 10,
    codigoMinsaMedico: "MINSA-123",
    numeroConsultorio: "12",
  }), undefined);
  assert.equal(parseCrearProgramacionInput({
    fecha: "2026-10-26",
    jornada: "PM",
    limitePacientes: 61,
    codigoMinsaMedico: "MINSA-123",
    numeroConsultorio: "12",
  }), undefined);
});

test("programación annulment requires a UUID and a bounded reason", () => {
  assert.deepEqual(parseAnularProgramacionInput(
    "3c5e8c5f-94f6-469c-9cc6-68ae52f8699c",
    { motivoAnulacion: "Cambio de jornada" },
  ), {
    codigoProgramacion: "3c5e8c5f-94f6-469c-9cc6-68ae52f8699c",
    motivoAnulacion: "Cambio de jornada",
  });
  assert.equal(parseAnularProgramacionInput("no-es-guid", { motivoAnulacion: "Motivo" }), undefined);
  assert.equal(parseAnularProgramacionInput(
    "3c5e8c5f-94f6-469c-9cc6-68ae52f8699c",
    { motivoAnulacion: "   " },
  ), undefined);
});

test("stored procedure conflicts are exposed as client errors", () => {
  const error = new Error("SQL Server error 50011.");
  const mapped = mapProgramacionProcedureError(error);
  assert.equal(mapped?.status, 409);
  assert.equal(mapped?.message, "El médico ya tiene una programación activa en esa fecha y jornada.");
});

test("unknown stored procedure errors remain unmapped", () => {
  assert.equal(mapProgramacionProcedureError(new Error("Connection failed.")), undefined);
});
