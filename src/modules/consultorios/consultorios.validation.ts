import type { ConsultorioQuery } from "./consultorios.types.ts";
import {
    asRecord,
    parseOptionalText,
    parsePagination,
} from "../../utils/global-validations.ts";

export function parseListarConsultoriosQuery(value: unknown): ConsultorioQuery | undefined {
    const record = asRecord(value);
    if (!record) return undefined;

    const busqueda = parseOptionalText(record.busqueda, 100);
    const codigoAreaMedica = parseOptionalText(record.codigoAreaMedica, 20);
    const paginacion = parsePagination(record);
    if (busqueda === undefined || codigoAreaMedica === undefined || !paginacion) return undefined;

    return {
        busqueda,
        codigoAreaMedica,
        ...paginacion,
    };
}