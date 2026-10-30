import * as registroRepository from "./registro.repository.ts";
import type { AfiliadoInss, ConsultaCreada, CrearConsultaInput, TipoAfiliado } from "./registro.types.ts";

export async function validarPerCapita(numeroInss: string): Promise<AfiliadoInss | null> {
  const [afiliado] = await registroRepository.consultarPerCapita(numeroInss);
  return afiliado ?? null;
}

export async function obtenerTiposAfiliado(): Promise<TipoAfiliado[]> {
  return await registroRepository.consultarTiposAfiliados();
}

export async function registrarConsulta(
  input: CrearConsultaInput,
  nombreUsuario: string,
): Promise<ConsultaCreada> {
  const result = await registroRepository.crearRegistroConsulta(input, nombreUsuario);
  return {
    codigoConsulta: result.codigoConsulta,
    mensaje: "Consulta registrada exitosamente.",
  };
}

// export async function obtenerRegistrosConsultas(query) {
  
// }