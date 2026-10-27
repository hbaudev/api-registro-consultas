import { getPool } from "../../database/pool.ts";
import type { MedicoDatabaseRow, MedicoQuery } from "./medicos.types.ts";

export async function obtenerMedicos(query: MedicoQuery): Promise<MedicoDatabaseRow[]> {
    const pool = await getPool();

    const assignments: string[] = [];
    const parameters: Array<string | number> = [];

    if (query.busqueda !== null) {
        assignments.push("@Busqueda = ?");
        parameters.push(query.busqueda);
    }
    if (query.codigoEspecialidad !== null) {
        assignments.push("@CodigoEspecialidad = ?");
        parameters.push(query.codigoEspecialidad);
    }

    //Filtro de disponibles o no disponibles
    if (query.disponibilidad !== null) {
        assignments.push("@Disponibilidad = ?");
        parameters.push(query.disponibilidad ? 1 : 0);
    }

    assignments.push("@Pagina = ?", "@TamanioPagina = ?");
    parameters.push(query.pagina, query.tamanioPagina);

    const rows = await pool.query<MedicoDatabaseRow>(
        `EXEC [dbo].[sp_ObtenerMedicos] ${assignments.join(", ")}`,
        parameters,
    );

    return rows;
}