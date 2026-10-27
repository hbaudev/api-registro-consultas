import { getPool } from "../../database/pool.ts";
import type { CrearFilialInput, EditarFilialInput, Filial } from "./filiales.types.ts";

interface CreateFilialRow {
  filialId: number | string;
}

interface FilialDatabaseRow {
  FilialId: number | string;
  CodigoFilial: string;
  NombreFilial: string;
  FechaCreacion: Date | string;
  FechaModificacion: Date | string | null;
  RegistroAnulado: boolean | number;
  UsuarioCreacionId: number | string;
  CreadoPorUsuario: string;
  NombreCompletoCreador: string;
}

function mapFilial(row: FilialDatabaseRow): Filial {
  return {
    filialId: Number(row.FilialId),
    codigoFilial: row.CodigoFilial,
    nombreFilial: row.NombreFilial,
    fechaCreacion: row.FechaCreacion,
    fechaModificacion: row.FechaModificacion,
    registroAnulado: row.RegistroAnulado,
    usuarioCreacionId: Number(row.UsuarioCreacionId),
    creadoPorUsuario: row.CreadoPorUsuario,
    nombreCompletoCreador: row.NombreCompletoCreador,
  };
}

/** Ejecuta dbo.sp_ObtenerFiliales; NULL lista todas las filiales activas. */
export async function obtenerFiliales(filialId: number | null = null): Promise<Filial[]> {
  const pool = await getPool();
  // node-odbc solo tipa parámetros string/number; 0 representa "todas" y se
  // convierte a NULL en SQL. Los IDs válidos son positivos.
  const rows = filialId === null
    ? await pool.query<FilialDatabaseRow>("EXEC dbo.sp_ObtenerFiliales @FilialId = NULL")
    : await pool.query<FilialDatabaseRow>(
      "EXEC dbo.sp_ObtenerFiliales @FilialId = CAST(? AS INT)",
      [filialId],
    );
  return (rows ?? []).map(mapFilial);
}

/** Ejecuta dbo.sp_CrearFilial y lee su parámetro OUTPUT mediante un SELECT. */
export async function crearFilial(
  input: CrearFilialInput,
  usuarioCreacionId: number,
): Promise<number> {
  const pool = await getPool();
  const rows = await pool.query<CreateFilialRow>(
    `DECLARE @FilialIdCreada INT;
     EXEC dbo.sp_CrearFilial
       @CodigoFilial = ?,
       @NombreFilial = ?,
       @UsuarioCreacionId = ?,
       @FilialIdCreada = @FilialIdCreada OUTPUT;
     SELECT @FilialIdCreada AS filialId;`,
    [input.codigoFilial, input.nombreFilial, usuarioCreacionId],
  );

  const id = Number(rows?.[0]?.filialId);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error("sp_CrearFilial no devolvió el identificador creado.");
  }
  return id;
}

/** Ejecuta dbo.sp_EditarFilial. */
export async function editarFilial(
  input: EditarFilialInput,
  usuarioModificacionId: number,
): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `EXEC dbo.sp_EditarFilial
       @FilialId = ?,
       @CodigoFilial = ?,
       @NombreFilial = ?,
       @UsuarioModificacionId = ?`,
    [input.filialId, input.codigoFilial, input.nombreFilial, usuarioModificacionId],
  );
}

/** Ejecuta dbo.sp_AnularFilial (anulación lógica). */
export async function anularFilial(
  filialId: number,
  usuarioModificacionId: number,
): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `EXEC dbo.sp_AnularFilial
       @FilialId = ?,
       @UsuarioModificacionId = ?`,
    [filialId, usuarioModificacionId],
  );
}
