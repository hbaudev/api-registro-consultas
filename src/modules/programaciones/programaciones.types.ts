export interface ProgramacionQuery {
  fecha: string | null;
  codigoMinsa: string | null;
  numeroConsultorio: string | null;
  pagina: number;
  tamanioPagina: number;
}

export interface CrearProgramacionInput {
  fecha: string;
  jornada: "AM" | "PM";
  limitePacientes: number;
  codigoMinsaMedico: string;
  numeroConsultorio: string;
}

export interface AnularProgramacionInput {
  codigoProgramacion: string;
  motivoAnulacion: string;
}

export interface ProgramacionDatabaseRow {
  CodigoProgramacion: string;
  Fecha: Date | string;
  Jornada: "AM" | "PM";
  LimitePacientes: number | string;
  CuposOcupados?: number | string;
  CuposDisponibles?: number | string;
  EstaLleno?: boolean | number;
  CodigoMinsa: string;
  NombreMedico: string;
  ApellidoMedico: string | null;
  NumeroConsultorio: string;
  NombreConsultorio: string;
  TotalRegistros: number | string | bigint;
}

export interface Programacion {
  codigoProgramacion: string;
  fecha: Date | string;
  jornada: "AM" | "PM";
  limitePacientes: number;
  cuposOcupados: number;
  cuposDisponibles: number;
  estaLleno: boolean;
  codigoMinsaMedico: string;
  nombreMedico: string;
  apellidoMedico: string | null;
  numeroConsultorio: string;
  nombreConsultorio: string;
}

export interface ProgramacionesPage {
  programaciones: Programacion[];
  paginacion: {
    pagina: number;
    tamanioPagina: number;
    totalRegistros: number;
    totalPaginas: number;
  };
}

export interface ProgramacionCreada {
  codigoProgramacion: string;
}
