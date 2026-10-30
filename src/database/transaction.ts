import { getPool, invalidatePool } from "./pool.ts";

type Pool = Awaited<ReturnType<typeof getPool>>;
type Connection = Awaited<ReturnType<Pool["connect"]>>;

export async function withTransaction<T>(
  action: (connection: Connection) => Promise<T>,
): Promise<T> {
  const pool = await getPool();
  const connection = await pool.connect();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;
    const result = await action(connection);
    await connection.commit();
    transactionStarted = false;
    return result;
  } catch (error) {
    invalidatePool(pool, error);
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch {
        // Preserva el error original de la operación.
      }
    }
    throw error;
  } finally {
    await connection.close();
  }
}
