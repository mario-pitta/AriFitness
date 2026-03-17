/* eslint-disable prettier/prettier */
import { Equipamento } from 'src/equipamento/equipamento.interface';
import { GrupoMuscular } from 'src/grupoMuscular/GrupoMuscular.interface';
import { Musculo } from 'src/musculo/Musculo.interface';

export interface ExercicioNivel {
  id: number;
  nome: string;
  fl_ativo: boolean;
}

export interface ExercicioCategoria {
  id: number;
  nome: string;
  fl_ativo: boolean;
}

export interface ExercicioMecanica {
  id: number;
  nome: string;
  fl_ativo: boolean;
}

export interface ExercicioForcaTipo {
  id: number;
  nome: string;
  fl_ativo: boolean;
}

export interface ExercicioMusculo {
  id?: number;
  exercicio_id?: number;
  grupo_muscular_id: number;
  grupo_muscular?: GrupoMuscular;
  tipo: 'primario' | 'secundario';
}

export interface Exercicio {
  id: number;
  nome: string;
  fl_ativo: boolean;
  midia_url?: string;

  // FKs (mantidas para retrocompatibilidade)
  equipamento_id?: number;
  equipamento?: Equipamento;
  grupo_muscular_id?: number;    // músculo primário principal (legado)
  grupo_muscular?: GrupoMuscular;
  musculo_id?: number;           // deprecated — usar exercicio_musculo
  musculo?: Musculo;
  empresa_id?: string;

  // Novos campos (requerem scripts 05 e 06)
  nivel_id?: number;
  nivel?: ExercicioNivel;
  categoria_id?: number;
  categoria?: ExercicioCategoria;
  mecanica_id?: number;
  mecanica?: ExercicioMecanica;
  forca_tipo_id?: number;
  forca_tipo?: ExercicioForcaTipo;
  instrucoes?: string[];

  // Junction table (requer script 07)
  musculos?: ExercicioMusculo[];
}


