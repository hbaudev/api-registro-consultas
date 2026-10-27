import {
    asRecord,
    parseOptionalBoolean,
    parseOptionalText,
    parsePagination,
} from "../../utils/global-validations.ts";
import { MedicoQuery } from "./medicos.types.ts";

export function parseListarMedicosQuery(value: unknown): MedicoQuery | undefined {
    const record = asRecord(value);
    if (!record) return undefined;

    const busqueda = parseOptionalText(record.busqueda, 100);
    const codigoEspecialidad = parseOptionalText(record.codigoEspecialidad, 20);
    const disponibilidad = parseOptionalBoolean(record.disponibilidad);
    const paginacion = parsePagination(record);
    if (
        busqueda === undefined ||
        codigoEspecialidad === undefined ||
        disponibilidad === undefined ||
        !paginacion
    ) return undefined;

    return {
        busqueda,
        codigoEspecialidad,
        disponibilidad,
        ...paginacion,
    };
}