
import { Equipamento } from './Equipamento';
import { GrupoMuscular } from './GrupoMuscular';
import { Musculo } from './Musculo';

export interface Exercicio {
  id?: number;
  created_at: string | Date;
  nome: string;
  fl_ativo: true;
  grupo_muscular_id?: number;
  grupo_muscular?: GrupoMuscular
  musculo_id?: number;
  musculo?: Musculo;
  equipamento_id?: number;
  equipamento?: Equipamento;
  midia_url?: string;
  img_url?: string;
}



