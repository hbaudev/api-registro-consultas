import * as filialesRepository from "./filiales.repository.ts";
import type { CrearFilialInput, EditarFilialInput, Filial } from "./filiales.types.ts";

function asUserId(userId: number | string): number {
  const id = Number(userId);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error("El usuario de la sesión tiene un identificador inválido.");
  }
  return id;
}

export async function listarFiliales(): Promise<Filial[]> {
  return filialesRepository.obtenerFiliales();
}

export async function buscarFilial(filialId: number): Promise<Filial | undefined> {
  const rows = await filialesRepository.obtenerFiliales(filialId);
  return rows[0];
}

export async function registrarFilial(
  input: CrearFilialInput,
  usuarioId: number | string,
): Promise<number> {
  return filialesRepository.crearFilial(input, asUserId(usuarioId));
}

export async function actualizarFilial(
  input: EditarFilialInput,
  usuarioId: number | string,
): Promise<void> {
  await filialesRepository.editarFilial(input, asUserId(usuarioId));
}

export async function eliminarFilial(
  filialId: number,
  usuarioId: number | string,
): Promise<void> {
  await filialesRepository.anularFilial(filialId, asUserId(usuarioId));
}
