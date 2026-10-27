import { getPool } from "../../database/pool.ts";
import { mapProgramacionProcedureError } from "./programaciones.errors.ts";
import type {
  AnularProgramacionInput,
  CrearProgramacionInput,
  ProgramacionCreada,
  ProgramacionDatabaseRow,
  ProgramacionQuery,
} from "./programaciones.types.ts";

export async function obtenerProgramaciones(query: ProgramacionQuery): Promise<ProgramacionDatabaseRow[]> {
  const pool = await getPool();
  const assignments: string[] = [];
  const parameters: Array<string | number> = [];

  if (query.fecha !== null) {
    assignments.push("@Fecha = ?");
    parameters.push(query.fecha);
  }
  if (query.codigoMinsa !== null) {
    assignments.push("@CodigoMinsa = ?");
    parameters.push(query.codigoMinsa);
  }
  if (query.numeroConsultorio !== null) {
    assignments.push("@NumeroConsultorio = ?");
    parameters.push(query.numeroConsultorio);
  }
  assignments.push("@Pagina = ?", "@TamanioPagina = ?");
  parameters.push(query.pagina, query.tamanioPagina);

  return pool.query<ProgramacionDatabaseRow>(
    `EXEC [dbo].[sp_ObtenerProgramacionConsultas] ${assignments.join(", ")}`,
    parameters,
  );
}

export async function crearProgramacion(
  input: CrearProgramacionInput,
  nombreUsuarioCreacion: string,
): Promise<ProgramacionCreada> {
  const pool = await getPool();
  try {
    const rows = await pool.query<{
      CodigoProgramacionCreada: string;
    }>(
      `DECLARE @ProgramacionConsultaIdCreada INT;
       DECLARE @CodigoProgramacionCreada UNIQUEIDENTIFIER;
       EXEC [dbo].[sp_CrearProgramacionConsulta]
         @Fecha = ?,
         @Jornada = ?,
         @LimitePacientes = ?,
         @CodigoMinsaMedico = ?,
         @NumeroConsultorio = ?,
         @NombreUsuarioCreacion = ?,
         @ProgramacionConsultaIdCreada = @ProgramacionConsultaIdCreada OUTPUT,
         @CodigoProgramacionCreada = @CodigoProgramacionCreada OUTPUT;
       SELECT @CodigoProgramacionCreada AS CodigoProgramacionCreada;`,
      [
        input.fecha,
        input.jornada,
        input.limitePacientes,
        input.codigoMinsaMedico,
        input.numeroConsultorio,
        nombreUsuarioCreacion,
      ],
    );
    const codigoProgramacion = rows?.[0]?.CodigoProgramacionCreada;
    if (!codigoProgramacion) {
      throw new Error("sp_CrearProgramacionConsulta no devolvió la programación creada.");
    }
    return { codigoProgramacion };
  } catch (error) {
    const mappedError = mapProgramacionProcedureError(error);
    if (mappedError) throw mappedError;
    throw error;
  }
}

export async function anularProgramacion(
  input: AnularProgramacionInput,
  nombreUsuarioAnulacion: string,
): Promise<void> {
  const pool = await getPool();
  try {
    await pool.query(
      `EXEC [dbo].[sp_AnularProgramacionConsulta]
         @CodigoProgramacion = ?,
         @MotivoAnulacion = ?,
         @NombreUsuarioAnulacion = ?`,
      [input.codigoProgramacion, input.motivoAnulacion, nombreUsuarioAnulacion],
    );
  } catch (error) {
    const mappedError = mapProgramacionProcedureError(error);
    if (mappedError) throw mappedError;
    throw error;
  }
}
