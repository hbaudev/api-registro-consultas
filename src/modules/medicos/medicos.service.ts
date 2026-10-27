import * as medicosRepository from "./medicos.repository.ts";
import type {
    Medico,
    MedicoDatabaseRow,
    MedicoQuery,
    MedicosPage,
} from "./medicos.types.ts";

function mapMedico(row: MedicoDatabaseRow): Medico {
    return {
        codigoMinsa: row.CodigoMinsa,
        cedula: row.Cedula,
        telefono: row.Telefono,
        disponibilidad: Boolean(row.Disponibilidad),
        nombre: row.Nombre,
        apellido: row.Apellido,
        codigoEspecialidad: row.CodigoEspecialidad,
        nombreEspecialidad: row.NombreEspecialidad,
    };
}

export async function listarMedicos(query: MedicoQuery): Promise<MedicosPage> {
    const rows = await medicosRepository.obtenerMedicos(query);
    const totalRegistros = rows.length > 0 ? Number(rows[0].TotalRegistros) : 0;

    return {
        medicos: rows.map(mapMedico),
        paginacion: {
            pagina: query.pagina,
            tamanioPagina: query.tamanioPagina,
            totalRegistros,
            totalPaginas: Math.ceil(totalRegistros / query.tamanioPagina),
        },
    };
}