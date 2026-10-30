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