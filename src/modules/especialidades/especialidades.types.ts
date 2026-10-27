import { Paginacion } from "../../types/paginacion/index.ts";

export interface EspecialidadQuery {
    busqueda: string | null;
    pagina: number;
    tamanioPagina: number;
}

export interface Especialidad {
    especialidadId: number;
    codigoEspecialidad: string | null;
    nombreEspecialidad: string;
    fechaCreacion: Date | string;
}

export interface EspecialidadPage {
    especialidades: Especialidad[];
    paginacion: Paginacion;
}

export interface EspecialidadDatabaseRow {
    EspecialidadId: number;
    CodigoEspecialidad: string | null;
    NombreEspecialidad: string;
    FechaCreacion: Date | string;
    TotalRegistros: number | string | bigint;
}
