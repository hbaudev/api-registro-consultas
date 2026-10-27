export type ValidationRecord = Record<string, unknown>;

export interface PaginationInput {
    pagina: number;
    tamanioPagina: number;
}

//Convierte un valor en un objeto 
export function asRecord(value: unknown): ValidationRecord | undefined {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
    return value as ValidationRecord;
}

//Convierte un valor en un numero positivo
export function parsePositiveInteger(value: unknown, fallback: number, max?: number): number | undefined {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || (max !== undefined && parsed > max)) return undefined;
    return parsed;
}

export function parsePagination(
    record: ValidationRecord,
    defaultPageSize = 20,
    maxPageSize = 100,
): PaginationInput | undefined {
    const pagina = parsePositiveInteger(record.pagina, 1, 2_147_483_647);
    const tamanioPagina = parsePositiveInteger(record.tamanioPagina, defaultPageSize, maxPageSize);
    if (pagina === undefined || tamanioPagina === undefined) return undefined;
    return { pagina, tamanioPagina };
}

export function parseOptionalText(value: unknown, maxLength: number): string | null | undefined {
    if (value === undefined) return null;
    if (typeof value !== "string" || value.trim().length > maxLength) return undefined;
    return value.trim() || null;
}

export function parseRequiredText(value: unknown, maxLength: number): string | undefined {
    if (typeof value !== "string") return undefined;
    const text = value.trim();
    return text.length > 0 && text.length <= maxLength ? text : undefined;
}

export function parseDigits(value: unknown, minLength: number, maxLength: number): string | undefined {
    if (typeof value !== "string") return undefined;
    const digits = value.trim();
    if (digits.length < minLength || digits.length > maxLength || !/^\d+$/.test(digits)) return undefined;
    return digits;
}

//Convierte un valor en un booleano opcional
export function parseOptionalBoolean(value: unknown): boolean | null | undefined {
    if (value === undefined || value === null || value === "") return null;
    return parseBoolean(value);
}

//Convierte un valor en un booleano
export function parseBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") return undefined;
    const lower = value.toLowerCase();
    if (lower === "true" || lower === "1" || lower === "yes" || lower === "y") return true;
    if (lower === "false" || lower === "0" || lower === "no" || lower === "n") return false;
    return undefined;
}
