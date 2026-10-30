import * as programacionesRepository from "./programaciones.repository.ts";
import type {
  AnularProgramacionInput,
  CrearProgramacionInput,
  Programacion,
  ProgramacionDatabaseRow,
  ProgramacionQuery,
  ProgramacionesPage,
} from "./programaciones.types.ts";

function mapProgramacion(row: ProgramacionDatabaseRow): Programacion {
  const limitePacientes = Number(row.LimitePacientes);
  const cuposOcupados = Number(row.CuposOcupados ?? 0);
  const cuposDisponibles = Number(row.CuposDisponibles ?? (limitePacientes - cuposOcupados));
  // El cálculo directo numérico evita el bug de conversión de ODBC donde "0" como string es evaluado como truthy en JS
  const estaLleno = cuposDisponibles <= 0;

  return {
    codigoProgramacion: row.CodigoProgramacion,
    fecha: row.Fecha,
    jornada: row.Jornada,
    limitePacientes,
    cuposOcupados,
    cuposDisponibles,
    estaLleno,
    codigoMinsaMedico: row.CodigoMinsa,
    nombreMedico: row.NombreMedico,
    apellidoMedico: row.ApellidoMedico,
    numeroConsultorio: row.NumeroConsultorio,
    nombreConsultorio: row.NombreConsultorio,
  };
}

export async function listarProgramaciones(query: ProgramacionQuery): Promise<ProgramacionesPage> {
  const rows = await programacionesRepository.obtenerProgramaciones(query);
  const totalRegistros = rows.length > 0 ? Number(rows[0].TotalRegistros) : 0;

  return {
    programaciones: rows.map(mapProgramacion),
    paginacion: {
      pagina: query.pagina,
      tamanioPagina: query.tamanioPagina,
      totalRegistros,
      totalPaginas: Math.ceil(totalRegistros / query.tamanioPagina),
    },
  };
}

export async function registrarProgramacion(
  input: CrearProgramacionInput,
  nombreUsuarioCreacion: string,
) {
  return programacionesRepository.crearProgramacion(input, nombreUsuarioCreacion);
}

export async function cancelarProgramacion(
  input: AnularProgramacionInput,
  nombreUsuarioAnulacion: string,
): Promise<void> {
  await programacionesRepository.anularProgramacion(input, nombreUsuarioAnulacion);
}
