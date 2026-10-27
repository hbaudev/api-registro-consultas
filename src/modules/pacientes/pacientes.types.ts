export interface PacienteQuery {
  busqueda: string | null;
  tipoSeguroId: number | null;
  pagina: number;
  tamanioPagina: number;
}

export interface Paciente {
  pacienteId: number;
  numeroInss: number | null;
  numeroCedula: string | null;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  fechaNacimiento: Date | string | null;
  empresa: string | null;
  tipoSeguroId: number;
  codigoTipoSeguro: string;
  tipoSeguro: string;
  titularId: number | null;
  fechaCreacion: Date | string;
}

export interface PacientesPage {
  pacientes: Paciente[];
  paginacion: {
    pagina: number;
    tamanioPagina: number;
    totalRegistros: number;
    totalPaginas: number;
  };
}

export interface PacienteDatabaseRow {
  PacienteId: number | string;
  NumeroInss: number | string | null;
  NumeroCedula: string | null;
  Nombres: string;
  Apellidos: string;
  Telefono: string | null;
  FechaNacimiento: Date | string | null;
  Empresa: string | null;
  TipoSeguroId: number | string;
  CodigoTipoSeguro: string;
  TipoSeguro: string;
  TitularId: number | string | null;
  FechaCreacion: Date | string;
  TotalRegistros: number | string | bigint;
}

export interface ExpedientePorInss {
  expedienteId: number;
  pacienteExpedienteId: number;
  numeroInss: number | null;
  numeroCedula: string | null;
  nombreCompletoPaciente: string;
  numeroExpediente: string;
  pacienteEspecial: boolean;
  autorizadoGerencia: boolean;
  fechaNacimiento: Date | string | null;
  fechaCreacion: Date | string;
  fechaModificacion: Date | string | null;
  registroAnulado: boolean;
}

export interface ExpedientePorInssDatabaseRow {
  ExpedienteId: number | string;
  PacienteExpedienteId: number | string;
  NumeroInss: number | string | null;
  NumeroCedula: string | null;
  NombreCompletoPaciente: string;
  NumeroExpediente: string;
  PacienteEspecial: boolean | number | string;
  AutorizadoGerencia: boolean | number | string;
  FechaNacimiento: Date | string | null;
  FechaCreacion: Date | string;
  FechaModificacion: Date | string | null;
  RegistroAnulado: boolean | number | string;
}
