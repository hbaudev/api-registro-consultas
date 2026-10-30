import * as pacientesRepository from "./pacientes.repository.ts";
import type {
  ExpedientePorInss,
  ExpedientePorInssDatabaseRow,
  Paciente,
  PacienteDatabaseRow,
  PacienteQuery,
  PacienteCompletoRow,
  PacientesPage,
  PacienteCompleto
} from "./pacientes.types.ts";

function mapPaciente(row: PacienteDatabaseRow): Paciente {
  return {
    pacienteId: Number(row.PacienteId),
    numeroInss: row.NumeroInss === null ? null : Number(row.NumeroInss),
    numeroCedula: row.NumeroCedula,
    nombres: row.Nombres,
    apellidos: row.Apellidos,
    telefono: row.Telefono,
    fechaNacimiento: row.FechaNacimiento,
    empresa: row.Empresa,
    tipoSeguroId: Number(row.TipoSeguroId),
    codigoTipoSeguro: row.CodigoTipoSeguro,
    tipoSeguro: row.TipoSeguro,
    titularId: row.TitularId === null ? null : Number(row.TitularId),
    fechaCreacion: row.FechaCreacion,
  };
}

export async function listarPacientes(query: PacienteQuery): Promise<PacientesPage> {
  const rows = await pacientesRepository.obtenerPacientes(query);
  const totalRegistros = rows.length > 0 ? Number(rows[0].TotalRegistros) : 0;

  return {
    pacientes: rows.map(mapPaciente),
    paginacion: {
      pagina: query.pagina,
      tamanioPagina: query.tamanioPagina,
      totalRegistros,
      totalPaginas: Math.ceil(totalRegistros / query.tamanioPagina),
    },
  };
}

function isDatabaseBit(value: boolean | number | string): boolean {
  return value === true
    || value === 1
    || value === "1"
    || (typeof value === "string" && value.toLowerCase() === "true");
}

function mapExpediente(row: ExpedientePorInssDatabaseRow): ExpedientePorInss {
  return {
    expedienteId: Number(row.ExpedienteId),
    pacienteExpedienteId: Number(row.PacienteExpedienteId),
    numeroInss: row.NumeroInss === null ? null : Number(row.NumeroInss),
    numeroCedula: row.NumeroCedula,
    nombreCompletoPaciente: row.NombreCompletoPaciente,
    numeroExpediente: row.NumeroExpediente,
    pacienteEspecial: isDatabaseBit(row.PacienteEspecial),
    autorizadoGerencia: isDatabaseBit(row.AutorizadoGerencia),
    fechaNacimiento: row.FechaNacimiento,
    fechaCreacion: row.FechaCreacion,
    fechaModificacion: row.FechaModificacion,
    registroAnulado: isDatabaseBit(row.RegistroAnulado),
  };
}

function mapPacienteCompleto(row: PacienteCompletoRow): PacienteCompleto {
  return {
    numeroInss: row.NumeroInss,
    numeroCedula: row.NumeroCedula,
    nombres: row.Nombres,
    apellidos: row.Apellidos,
    empresa: row.Empresa,
    codigoTipoSeguro: row.CodigoTipoSeguro,
    tipoSeguro: row.TipoSeguro,
    numeroExpediente: row.NumeroExpediente,
    pacienteEspecial: isDatabaseBit(row.PacienteEspecial),
    autorizadoGerencia: isDatabaseBit(row.AutorizadoGerencia),
    fechaNacimiento: row.FechaNacimiento,
    fechaCreacionExpediente: row.FechaCreacionExpediente,
  };
}

export async function obtenerExpedientesPorInss(numeroInss: number): Promise<ExpedientePorInss[]> {
  const rows = await pacientesRepository.obtenerExpedientesPorInss(numeroInss);
  return rows.map(mapExpediente);
}

export async function obtenerPacienteCompletoPorInss(numeroInss: number): Promise<PacienteCompleto[]> {
  const rows = await pacientesRepository.obtenerPacienteCompletoPorInss(numeroInss);
  return rows.map(mapPacienteCompleto);
}