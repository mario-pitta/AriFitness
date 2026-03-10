import { Treino } from './Treino';
import { Usuario } from './Usuario';
import { FichaSessao } from './FichaSessao';


export interface FichaAluno {
  id?: number; //20;
  created_at?: Date | string; //'2024-08-08T02:23:24.561621+00:00';
  usuario_id: number; //30;
  cadastrado_por: number | Partial<Usuario> /*{
    id: 30;
    nome: 'Aluno Teste';
    };*/;
  descricao: string; //'testando insert de ficha';
  ficha_data_inicio: Date | string; //'2024-08-07';
  ficha_data_fim: Date | string; //'2024-10-07';
  objetivo: string; // 'testar e validar insercao de ficha';
  instrutor_id: number; //30;
  peso_inicial: any;
  peso_meta: any;
  fl_ativo: boolean; //false;
  instrutor: number | Partial<Usuario> /*{
    id: 30;
    nome: 'Aluno Teste';
  };*/;
  aluno: Partial<Usuario> /*{
    id: 30;
    nome: 'Aluno Teste';
  };*/;
  treinos_cadastrados?: {
    treino: Treino[];
  }[];
  treinos?: Partial<Treino>[] | any;
  sessoes?: FichaSessao[];
}

