import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createApp } from "../src/app.ts";
import { config, resolveRole } from "../src/config/env.ts";
import { isUserActive } from "../src/modules/auth/auth.service.ts";
import { parseLoginInput } from "../src/modules/auth/auth.validation.ts";
import { createSessionToken, hashSessionToken } from "../src/utils/tokens.ts";

test("login input requires a username and bcrypt-compatible password length", () => {
  assert.deepEqual(parseLoginInput({ username: "  operator  ", password: "valid-password" }), {
    username: "operator",
    password: "valid-password",
  });
  assert.notEqual(parseLoginInput({ username: "operator", password: "á".repeat(36) }), undefined);
  assert.equal(parseLoginInput({ username: "u".repeat(51), password: "valid-password" }), undefined);
  assert.equal(parseLoginInput({ username: "operator", password: "" }), undefined);
  assert.equal(parseLoginInput({ username: "operator", password: "á".repeat(37) }), undefined);
  assert.equal(parseLoginInput(null), undefined);
});

test("session tokens are random and only their SHA-256 digest is stored", () => {
  const firstToken = createSessionToken();
  const secondToken = createSessionToken();

  assert.notEqual(firstToken, secondToken);
  assert.equal(firstToken.length, 43);
  assert.equal(hashSessionToken(firstToken).length, 64);
  assert.equal(hashSessionToken(firstToken), hashSessionToken(firstToken));
  assert.notEqual(hashSessionToken(firstToken), firstToken);
});

test("database role IDs map to the three configured application roles", () => {
  assert.equal(resolveRole(config.roleIds.Administrador), "Administrador");
  assert.equal(resolveRole(config.roleIds.Admisionista), "Admisionista");
  assert.equal(resolveRole(config.roleIds["Medico/a"]), "Medico/a");
  assert.equal(resolveRole(config.roleIds["Enfermero/a"]), "Enfermero/a");
  assert.equal(resolveRole(999), null);
});

test("SQL Server BIT values returned by ODBC are recognized as active", () => {
  assert.equal(isUserActive(true), true);
  assert.equal(isUserActive(1), true);
  assert.equal(isUserActive("1"), true);
  assert.equal(isUserActive("true"), true);
  assert.equal(isUserActive(false), false);
  assert.equal(isUserActive(0), false);
  assert.equal(isUserActive("0"), false);
  assert.equal(isUserActive("false"), false);
});

test("auth routes enforce origin checks for session cookies and expose expected public responses", async () => {
  const server = createApp().listen(0);
  await once(server, "listening");

  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);

    const openApi = await fetch(`${baseUrl}/api-docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const spec = await openApi.json() as {
      openapi: string;
      components: { securitySchemes: Record<string, { name: string; in: string }> };
      paths: Record<string, unknown>;
    };
    assert.equal(spec.openapi, "3.0.3");
    assert.equal(spec.components.securitySchemes.sessionCookie.in, "cookie");
    assert.equal(spec.components.securitySchemes.sessionCookie.name, config.sessionCookie.name);
    assert.ok(spec.paths["/api/auth/refresh"]);
    assert.ok(spec.paths["/api/pacientes/expediente/{inss}"]);

    const swaggerUi = await fetch(`${baseUrl}/api-docs`, { redirect: "manual" });
    assert.equal(swaggerUi.status, 301);
    assert.equal(swaggerUi.headers.get("location"), "/api-docs/");

    const swaggerPage = await fetch(`${baseUrl}/api-docs/`);
    assert.equal(swaggerPage.status, 200);
    assert.match(await swaggerPage.text(), /Registro de consultas API/);

    const unauthenticatedWrite = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "", password: "" }),
    });
    assert.equal(unauthenticatedWrite.status, 400);

    const invalidLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:5173",
      },
      body: JSON.stringify({ username: "", password: "" }),
    });
    assert.equal(invalidLogin.status, 400);

    const csrfBlocked = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `${config.sessionCookie.name}=test-session`,
        origin: "https://untrusted.example",
      },
    });
    assert.equal(csrfBlocked.status, 403);

    const unauthenticated = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(unauthenticated.status, 401);

    const refreshWithoutSession = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
    });
    assert.equal(refreshWithoutSession.status, 401);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});
