import { getPool } from "../../database/pool.ts";
import { EspecialidadQuery, EspecialidadDatabaseRow } from "./especialidades.types.ts";

export async function obtenerEspecialidades(query: EspecialidadQuery): Promise<EspecialidadDatabaseRow[]> {
    const pool = await getPool();
    const assignments: string[] = [];
    const parameters: Array<string | number> = [];

    // Buscar por nombre; el SP permite omitir el filtro cuando no se envía.
    if (query.busqueda !== null) {
        assignments.push("@Nombre = ?");
        parameters.push(query.busqueda);
    }

    assignments.push("@Pagina = ?", "@TamanioPagina = ?");
    parameters.push(query.pagina, query.tamanioPagina);

    const rows = await pool.query<EspecialidadDatabaseRow>(
        `EXEC [dbo].[sp_BuscarEspecialidades] ${assignments.join(", ")}`,
        parameters,
    );

    return rows;
}
