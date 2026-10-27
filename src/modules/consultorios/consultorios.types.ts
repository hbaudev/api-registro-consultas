export interface ConsultorioQuery {
    busqueda: string | null;
    codigoAreaMedica: string | null;
    pagina: number;
    tamanioPagina: number;
}

export interface Consultorio {
    numeroConsultorio: string;
    nombreConsultorio: string;
    disponibilidad: boolean;
    codigoAreaMedica: string | null;
    nombreAreaMedica: string | null;
}

export interface ConsultoriosPage {
    consultorios: Consultorio[];
    paginacion: {
        pagina: number;
        tamanioPagina: number;
        totalRegistros: number;
        totalPaginas: number;
    };
}

export interface ConsultorioDatabaseRow {
    NumeroConsultorio: string;
    NombreConsultorio: string;
    Disponibilidad: boolean;
    CodigoAreaMedica: string | null;
    NombreAreaMedica: string | null;
    TotalRegistros: number | bigint;
}