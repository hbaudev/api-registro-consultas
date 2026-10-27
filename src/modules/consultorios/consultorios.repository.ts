import { getPool } from "../../database/pool.ts";
import type { ConsultorioDatabaseRow, ConsultorioQuery } from "./consultorios.types.ts";

export async function obtenerConsultorios(query: ConsultorioQuery): Promise<ConsultorioDatabaseRow[]> {
    const pool = await getPool();
    const assignments: string[] = [];
    const parameters: Array<string | number> = [];

    if (query.busqueda !== null) {
        assignments.push("@Busqueda = ?");
        parameters.push(query.busqueda);
    }
    if (query.codigoAreaMedica !== null) {
        assignments.push("@CodigoAreaMedica = ?");
        parameters.push(query.codigoAreaMedica);
    }

    assignments.push("@Pagina = ?", "@TamanioPagina = ?");
    parameters.push(query.pagina, query.tamanioPagina);

    const rows = await pool.query<ConsultorioDatabaseRow>(
        `EXEC [dbo].[sp_ObtenerConsultorios] ${assignments.join(", ")}`,
        parameters,
    );

    return rows;
}