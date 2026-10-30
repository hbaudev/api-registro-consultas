import { getPool } from "../../database/pool.ts";
import type {
  ExpedientePorInssDatabaseRow,
  PacienteCompletoParams,
  PacienteCompletoRow,
  PacienteDatabaseRow,
  PacienteQuery,
} from "./pacientes.types.ts";

export async function obtenerPacientes(query: PacienteQuery): Promise<PacienteDatabaseRow[]> {
  const pool = await getPool();
  const assignments: string[] = [];
  const parameters: Array<string | number> = [];

  if (query.busqueda !== null) {
    assignments.push("@Busqueda = ?");
    parameters.push(query.busqueda);
  }
  if (query.tipoSeguroId !== null) {
    assignments.push("@TipoSeguroId = ?");
    parameters.push(query.tipoSeguroId);
  }
  assignments.push("@Pagina = ?", "@TamanioPagina = ?");
  parameters.push(query.pagina, query.tamanioPagina);

  const rows = await pool.query<PacienteDatabaseRow>(
    `EXEC [dbo].[sp_ObtenerPacientes] ${assignments.join(", ")}`,
    parameters,
  );

  return rows;
}

export async function obtenerExpedientesPorInss(numeroInss: number): Promise<ExpedientePorInssDatabaseRow[]> {
  const pool = await getPool();
  return pool.query<ExpedientePorInssDatabaseRow>(
    "EXEC [dbo].[sp_ObtenerExpedientePorInss] @NumeroInss = ?",
    [numeroInss],
  );
}

export async function obtenerPacienteCompletoPorInss(numeroInss: number): Promise<PacienteCompletoRow[]> {
  const pool = await getPool();
  return pool.query<PacienteCompletoRow>(
    "EXEC [dbo].[sp_ObtenerPacienteCompletoPorInss] @NumeroInss = ?",
    [numeroInss],
  );
}
