import { getPool } from "../../database/pool.ts";
import type { AfiliadoInssRow, TipoAfiliadoRow } from "./ipss.types.ts";

export async function consultarPerCapita(numeroInss: string): Promise<AfiliadoInssRow[]> {
  const pool = await getPool("SIIPSS");
  return pool.query<AfiliadoInssRow>(
    "EXEC [dbo].[sp_ConsultarPerCapita] @NumeroINSS = ?",
    [numeroInss],
  );
}

export async function consultarTiposAfiliados(): Promise<TipoAfiliadoRow[]> {
  const pool = await getPool();
  return pool.query<TipoAfiliadoRow>(
    "EXEC [dbo].[sp_ObtenerTipoAfiliado]",
  );
}
