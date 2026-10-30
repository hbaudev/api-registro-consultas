import * as registroRepository from "./registro.repository.ts";
import type {
  AfiliadoInss,
  ConsultaCreada,
  CrearConsultaInput,
  TipoAfiliado,
  RegistroConsultaQuery,
  RegistroConsultaPage,
  RegistroConsultaDatabaseRow,
  RegistroConsulta
} from "./registro.types.ts";

export async function validarPerCapita(numeroInss: string): Promise<AfiliadoInss | null> {
  const [afiliado] = await registroRepository.consultarPerCapita(numeroInss);
  return afiliado ?? null;
}

export async function obtenerTiposAfiliado(): Promise<TipoAfiliado[]> {
  return await registroRepository.consultarTiposAfiliados();
}

export async function registrarConsulta(
  input: CrearConsultaInput,
  nombreUsuario: string,
): Promise<ConsultaCreada> {
  const result = await registroRepository.crearRegistroConsulta(input, nombreUsuario);
  return {
    codigoConsulta: result.codigoConsulta,
    mensaje: "Consulta registrada exitosamente.",
  };
}

function mapRegistroConsulta(row: RegistroConsultaDatabaseRow): RegistroConsulta {
  return {
    codigoConsulta: row.CodigoConsulta,
    fechaConsulta: row.FechaConsulta,
    horaRegistro: row.HoraRegistro,
    estadoAtencion: row.EstadoAtencion,
    esCitado: Boolean(row.EsCitado),
    esTraslado: Boolean(row.EsTraslado),
    sacarExpediente: Boolean(row.SacarExpediente),
    numeroInss: row.NumeroInss,
    nombresPaciente: row.NombresPaciente,
    apellidosPaciente: row.ApellidosPaciente,
    jornada: row.Jornada,
    nombreMedico: row.NombreMedico,
    apellidoMedico: row.ApellidoMedico,
    numeroConsultorio: row.NumeroConsultorio,
    nombreConsultorio: row.NombreConsultorio,
  };
}

export async function obtenerRegistrosConsultas(query: RegistroConsultaQuery): Promise<RegistroConsultaPage> {
  const rows = await registroRepository.obtenerRegistrosConsultas(query);
  const totalRegistros = rows.length > 0 ? Number(rows[0].TotalRegistros) : 0;
  
  return {
    consultas: rows.map(mapRegistroConsulta),
    paginacion: {
      pagina: query.pagina,
      tamanioPagina: query.tamanioPagina,
      totalRegistros: totalRegistros,
      totalPaginas: Math.ceil(totalRegistros / query.tamanioPagina),
    }
  }
}

