export interface MedicoQuery {
    busqueda: string | null;
    codigoEspecialidad: string | null;
    disponibilidad: boolean | null;
    pagina: number;
    tamanioPagina: number;
}

export interface Medico {
    codigoMinsa: string;
    cedula: string;
    telefono: string | null;
    disponibilidad: boolean;
    nombre: string;
    apellido: string;
    codigoEspecialidad: string | null;
    nombreEspecialidad: string | null;
}

export interface MedicosPage {
    medicos: Medico[];
    paginacion: {
        pagina: number;
        tamanioPagina: number;
        totalRegistros: number;
        totalPaginas: number;
    };
}

export interface MedicoDatabaseRow {
    CodigoMinsa: string;
    Cedula: string;
    Telefono: string | null;
    Disponibilidad: boolean | number;
    Nombre: string;
    Apellido: string;
    CodigoEspecialidad: string | null;
    NombreEspecialidad: string | null;
    TotalRegistros: number | string | bigint;
}
