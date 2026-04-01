
import { Equipamento } from './Equipamento';
import { GrupoMuscular } from './GrupoMuscular';
import { Musculo } from './Musculo';

export interface Exercicio {
  id?: number;
  created_at?: string | Date;
  nome: string;
  fl_ativo: boolean;
  empresa_id?: string | null;  // null = exercício global/oficial; string = customizado pela academia
  grupo_muscular_id?: number;
  grupo_muscular?: GrupoMuscular
  musculo_id?: number;
  musculo?: Musculo;
  equipamento_id?: number;
  equipamento?: Equipamento;
  midia_url?: string;
  midias_url?: string[];
  img_url?: string;
  musculos?: ExercicioMusculo[];
  nivel_id?: number;
  nivel?: any;
  instrucoes?: string[];
  usuario_id?: string | number;
}

export interface ExercicioMusculo {
  id?: number;
  tipo: 'primario' | 'secundario';
  grupo_muscular: GrupoMuscular;
}



