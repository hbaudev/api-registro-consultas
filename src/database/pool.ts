import "dotenv/config";
import odbc from "odbc";

type OdbcPool = Awaited<ReturnType<typeof odbc.pool>>;
type OdbcPoolConfig = string | odbc.PoolParameters;

interface PoolEntry {
  promise: Promise<OdbcPool>;
  pool?: OdbcPool;
}

const pools = new Map<string, PoolEntry>();
const poolInvalidators = new WeakMap<object, (error: unknown) => void>();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta configurar la variable de entorno ${name}.`);
  return value;
}

function booleanEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  throw new Error(`La variable ${name} debe ser "true" o "false".`);
}

function odbcValue(value: string): string {
  return `{${value.replace(/}/g, "}}")}}`;
}

function makeConnectionString(prefix: string): string {
  const portName = `${prefix}_PORT`;
  const portValue = process.env[portName];
  const port = portValue === undefined ? 1433 : Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${portName} debe ser un puerto válido.`);
  }

  return [
    `DRIVER=${odbcValue(process.env[`${prefix}_ODBC_DRIVER`] ?? "ODBC Driver 18 for SQL Server")}`,
    `SERVER=${odbcValue(`tcp:${requiredEnv(`${prefix}_SERVER`)},${port}`)}`,
    `DATABASE=${odbcValue(requiredEnv(`${prefix}_DATABASE`))}`,
    `UID=${odbcValue(requiredEnv(`${prefix}_USER`))}`,
    `PWD=${odbcValue(requiredEnv(`${prefix}_PASSWORD`))}`,
    `Encrypt=${booleanEnv(`${prefix}_ENCRYPT`, true) ? "yes" : "no"}`,
    `TrustServerCertificate=${booleanEnv(`${prefix}_TRUST_SERVER_CERTIFICATE`, true) ? "yes" : "no"}`,
    "ConnectTimeout=8",
  ].join(";");
}

/**
 * Return the shared ODBC pool for a logical database name. Pass a connection
 * string (or odbc.pool options) as the second argument to supply configuration
 * directly; otherwise envPrefix defaults to DB_<NAME> (e.g. DB_REGISTRO).
 */
export async function getPool(name = "default", config?: OdbcPoolConfig): Promise<OdbcPool> {
  if (typeof name !== "string" || !name.trim()) {
    throw new TypeError("El nombre del pool debe ser una cadena no vacía.");
  }

  const key = name.trim();
  const existingPool = pools.get(key);
  if (existingPool) {
    const pool = existingPool.pool ?? await existingPool.promise;
    existingPool.pool = pool;
    return wrapPool(pool, key, existingPool);
  }

  const connectionConfig = config ?? {
    connectionString: makeConnectionString(key === "default" ? "DB" : `DB_${key.toUpperCase()}`),
    loginTimeout: 8,
  };
  const poolPromise = typeof connectionConfig === "string"
    ? odbc.pool(connectionConfig)
    : odbc.pool(connectionConfig);
  const entry: PoolEntry = { promise: poolPromise };

  pools.set(key, entry);
  try {
    const pool = await poolPromise;
    entry.pool = pool;
    return wrapPool(pool, key, entry);
  } catch (error) {
    console.error("ODBC error:", getOdbcErrors(error) ?? error);
    if (pools.get(key) === entry) pools.delete(key);
    throw error;
  }
}

function wrapPool(pool: OdbcPool, key: string, entry: PoolEntry): OdbcPool {
  const invalidate = (error: unknown) => discardPool(key, entry, pool, error);
  const wrappedPool = new Proxy(pool, {
    get(target, property, receiver) {
      const method = Reflect.get(target, property, receiver);
      if ((property !== "query" && property !== "connect") || typeof method !== "function") {
        return method;
      }

      return (...args: unknown[]) => {
        const callbackIndex = args.length - 1;
        const callback = args[callbackIndex];
        if (typeof callback === "function") {
          args[callbackIndex] = (...callbackArgs: unknown[]) => {
            if (isBrokenConnectionError(callbackArgs[0])) invalidate(callbackArgs[0]);
            return Reflect.apply(callback, target, callbackArgs);
          };
          return Reflect.apply(method, target, args);
        }

        try {
          return Promise.resolve(Reflect.apply(method, target, args)).catch((error: unknown) => {
            invalidate(error);
            throw error;
          });
        } catch (error) {
          invalidate(error);
          throw error;
        }
      };
    },
  });
  poolInvalidators.set(wrappedPool, invalidate);
  return wrappedPool;
}

function discardPool(key: string, entry: PoolEntry, pool: OdbcPool, error: unknown): void {
  if (!isBrokenConnectionError(error) || pools.get(key) !== entry) return;

  pools.delete(key);
  console.warn(`Se descarta el pool ODBC "${key}" por una conexión interrumpida.`);
  void pool.close().catch((closeError: unknown) => {
    console.error(`No se pudo cerrar el pool ODBC "${key}".`, closeError);
  });
}

export function invalidatePool(pool: OdbcPool, error: unknown): void {
  if (!isBrokenConnectionError(error)) return;
  poolInvalidators.get(pool)?.(error);
}

function isBrokenConnectionError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("odbcErrors" in error)) return false;
  const errors = error.odbcErrors;
  if (!Array.isArray(errors)) return false;

  return errors.some((item: unknown) => {
    if (typeof item !== "object" || item === null || !("state" in item)) return false;
    const state = String(item.state ?? "").toUpperCase();
    return state === "IMC06" || state.startsWith("08");
  });
}

function getOdbcErrors(error: unknown): unknown {
  if (typeof error !== "object" || error === null || !("odbcErrors" in error)) return undefined;
  return error.odbcErrors;
}

export async function closePools() {
  const openPools = [...pools.values()];
  pools.clear();
  await Promise.all(openPools.map(async ({ promise }) => {
    const pool = await promise;
    await pool.close();
  }));
}
