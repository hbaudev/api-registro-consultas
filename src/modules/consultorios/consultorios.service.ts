import * as consultoriosRepository from "./consultorios.repository.ts";
import {
    Consultorio,
    ConsultorioDatabaseRow,
    ConsultorioQuery,
    ConsultoriosPage,
} from "./consultorios.types.ts";

function mapConsultorio(row: ConsultorioDatabaseRow): Consultorio {
    return {
        numeroConsultorio: row.NumeroConsultorio,
        nombreConsultorio: row.NombreConsultorio,
        disponibilidad: Boolean(row.Disponibilidad),
        codigoAreaMedica: row.CodigoAreaMedica,
        nombreAreaMedica: row.NombreAreaMedica,
    };
}

export async function listarConsultorios(query: ConsultorioQuery): Promise<ConsultoriosPage> {
    const rows = await consultoriosRepository.obtenerConsultorios(query);
    const totalRegistros = rows.length > 0 ? Number(rows[0].TotalRegistros) : 0;

    return {
        consultorios: rows.map(mapConsultorio),
        paginacion: {
            pagina: query.pagina,
            tamanioPagina: query.tamanioPagina,
            totalRegistros,
            totalPaginas: Math.ceil(totalRegistros / query.tamanioPagina),
        },
    };
}