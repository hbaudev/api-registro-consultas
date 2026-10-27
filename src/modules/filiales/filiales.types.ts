export interface Filial {
  filialId: number;
  codigoFilial: string;
  nombreFilial: string;
  fechaCreacion: Date | string;
  fechaModificacion: Date | string | null;
  registroAnulado: boolean | number;
  usuarioCreacionId: number;
  creadoPorUsuario: string;
  nombreCompletoCreador: string;
}

export interface CrearFilialInput {
  codigoFilial: string;
  nombreFilial: string;
}

export interface EditarFilialInput extends CrearFilialInput {
  filialId: number;
}
