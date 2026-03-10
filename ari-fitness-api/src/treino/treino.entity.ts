/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
} from 'typeorm';
import { TreinoSessaoEntity } from './treino-sessao.entity';


@Entity('treino')
export class TreinoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: false, unique: false })
    nome: string;

    @Column({ nullable: true })
    descricao: string;

    @Column({ nullable: true, default: true })
    fl_publico: boolean;

    @Column({ nullable: true })
    cadastrado_por: number;

    @Column({ nullable: true, type: 'smallint' })
    nivel_dificuldade: number;

    @Column({ nullable: true })
    grupo_muscular_id: number;

    @Column({ default: true })
    fl_ativo: boolean;

    @Column({ nullable: true })
    parte_do_corpo_id: number;

    @Column({ type: 'uuid' })
    empresa_id: string;

    @OneToMany(() => TreinoSessaoEntity, (sessao) => sessao.treino)
    sessoes: TreinoSessaoEntity[];
}

