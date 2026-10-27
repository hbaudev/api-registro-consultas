import * as especialidadesRepository from "./especialidades.repository.ts"
import { Especialidad, EspecialidadDatabaseRow, EspecialidadPage, EspecialidadQuery } from "./especialidades.types.ts"

function mapEspecialidad(row: EspecialidadDatabaseRow): Especialidad {
    return {
        especialidadId: Number(row.EspecialidadId),
        codigoEspecialidad: row.CodigoEspecialidad,
        nombreEspecialidad: row.NombreEspecialidad,
        fechaCreacion: row.FechaCreacion,
    }
}

export async function listarEspecialidades(query: EspecialidadQuery): Promise<EspecialidadPage> {
    const rows = await especialidadesRepository.obtenerEspecialidades(query);
    const totalRegistros = rows.length > 0 ? Number(rows[0].TotalRegistros) : 0;

    return {
        especialidades: rows.map(mapEspecialidad),
        paginacion: {
            pagina: query.pagina,
            tamanioPagina: query.tamanioPagina,
            totalRegistros,
            totalPaginas: Math.ceil(totalRegistros / query.tamanioPagina)
        }
    }
}