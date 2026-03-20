/* eslint-disable prettier/prettier */
export interface Service {
    id?: string;
    empresa_id: string;
    default_service_id?: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
}
