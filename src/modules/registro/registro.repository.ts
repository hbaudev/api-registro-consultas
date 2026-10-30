import { getPool } from "../../database/pool.ts";
import { mapRegistroProcedureError } from "./registro.errors.ts";
import type { 
  AfiliadoInssRow, 
  CrearConsultaInput, 
  TipoAfiliadoRow,
  RegistroConsultaQuery,
  RegistroConsultaPage,
  RegistroConsultaDatabaseRow
} from "./registro.types.ts";

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

export async function obtenerRegistrosConsultas(query: RegistroConsultaQuery): Promise<RegistroConsultaDatabaseRow[]> {
  const pool = await getPool();

  const assignments: string[] = [];
  const parameters: Array<string | number> = [];

  if (query.fecha !== null) {
    assignments.push("@Fecha = ?");
    parameters.push(query.fecha);
  }
  if (query.numeroInss !== null) {
    assignments.push("@NumeroInss = ?");
    parameters.push(query.numeroInss)
  }
  if (query.codigoConsultorio !== null) {
    assignments.push("@CodigoConsultorio = ?");
    parameters.push(query.codigoConsultorio);
  }

  assignments.push("@Pagina = ?", "@TamanioPagina = ?");
  parameters.push(query.pagina, query.tamanioPagina);

  const rows = await pool.query<RegistroConsultaDatabaseRow>(
    `EXEC [dbo].[sp_ObtenerRegistroConsultas] ${assignments.join(", ")}`,
    parameters,
  );

  return rows;
}

export async function crearRegistroConsulta(
  input: CrearConsultaInput,
  nombreUsuario: string,
): Promise<{ codigoConsulta: string }> {
  const pool = await getPool();
  try {
    const rows = await pool.query<{ CodigoConsultaCreada: string }>(
      `DECLARE @CodigoConsultaCreada UNIQUEIDENTIFIER;
       EXEC [dbo].[sp_CrearRegistroConsulta]
         @CodigoProgramacion = ?,
         @NombreUsuario = ?,
         @NumeroInss = ?,
         @EsCitado = ?,
         @EsTraslado = ?,
         @SacarExpediente = ?,
         @Observaciones = ?,
         @CodigoConsultaCreada = @CodigoConsultaCreada OUTPUT;
       SELECT @CodigoConsultaCreada AS CodigoConsultaCreada;`,
      [
        input.codigoProgramacion,
        nombreUsuario,
        input.numeroInss,
        input.esCitado ? 1 : 0,
        input.esTraslado ? 1 : 0,
        input.sacarExpediente ? 1 : 0,
        input.observaciones ?? "",
      ],
    );

    const codigoConsulta = rows?.[0]?.CodigoConsultaCreada;
    if (!codigoConsulta) {
      throw new Error("No se pudo obtener el código de la consulta creada.");
    }
    return { codigoConsulta };
  } catch (error) {
    const mappedError = mapRegistroProcedureError(error);
    if (mappedError) throw mappedError;
    throw error;
  }
}
