/** Campos del afiliado que necesita el flujo inicial de validacion del INSS. */
export interface AfiliadoInss {
  NumeroINSS: string;
  PrimerNombre: string | null;
  SegundoNombre: string | null;
  PrimerApellido: string | null;
  SegundoApellido: string | null;
  NoCedula: string | null;
  Estado: string | null;
}

export interface TipoAfiliado {
  TipoAseguradoId: number;
  CodigoTipo: string;
  Descripcion: string;
}

/** Tipos tal como los entrega node-odbc al leer SIIPSS. */
export type AfiliadoInssRow = AfiliadoInss;
export type TipoAfiliadoRow = TipoAfiliado;

export interface CrearConsultaInput {
  codigoProgramacion: string;
  numeroInss: number;
  esCitado?: boolean;
  esTraslado?: boolean;
  sacarExpediente?: boolean;
  observaciones?: string | null;
}

export interface ConsultaCreada {
  codigoConsulta: string;
  mensaje: string;
}

export interface ConsultasQuery {
  fecha: string | null;

}

export interface RegistroConsulta {
  codigoConsulta: string;
  fechaConsulta: string;
  horaRegistro: string;
  estadoAtencion: string;
  esCitado: boolean;
  esTraslado: boolean;
  sacarExpediente: boolean;
  numeroInss: string;
  nombresPaciente: string | null;
  apellidosPaciente: string | null;
  jornada: string | null;
  nombreMedico: string | null;
  apellidoMedico: string | null;
  numeroConsultorio: string | null;
  nombreConsultorio: string | null;
}

export interface RegistroConsultaDatabaseRow {
  CodigoConsulta: string;
  FechaConsulta: string;
  HoraRegistro: string;
  EstadoAtencion: string;
  EsCitado: boolean | number;
  EsTraslado: boolean | number;
  SacarExpediente: boolean | number;
  NumeroInss: string;
  NombresPaciente: string | null;
  ApellidosPaciente: string | null;
  Jornada: string | null;
  NombreMedico: string | null;
  ApellidoMedico: string | null;
  NumeroConsultorio: string | null;
  NombreConsultorio: string | null;
  TotalRegistros: number | string | bigint;
}

export interface RegistroConsultaPage {
  consultas: RegistroConsulta[];
  paginacion: {
    pagina: number;
    tamanioPagina: number;
    totalRegistros: number;
    totalPaginas: number;
  };
}

export interface RegistroConsultaQuery {
  fecha: string | null;
  numeroInss: number | null;
  codigoConsultorio: string | null;
  pagina: number;
  tamanioPagina: number;
}