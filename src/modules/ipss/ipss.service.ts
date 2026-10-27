import * as ipssRepository from "./ipss.repository.ts";
import type { AfiliadoInss, TipoAfiliado } from "./ipss.types.ts";

export async function validarPerCapita(numeroInss: string): Promise<AfiliadoInss | null> {
  const rows = await ipssRepository.consultarPerCapita(numeroInss);
  return rows[0] ?? null;
}

export async function obtenerTiposAfiliado(): Promise<TipoAfiliado[]> {
  return ipssRepository.consultarTiposAfiliados();
}
