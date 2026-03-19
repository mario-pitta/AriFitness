/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
} from 'typeorm';
import { FichaSessaoEntity } from './ficha-sessao.entity';


@Entity('ficha_aluno')
export class FichaAlunoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    usuario_id: number;

    @Column({ nullable: true })
    cadastrado_por: number;

    @Column({ nullable: true })
    descricao: string;

    @Column({ nullable: true })
    empresa_id: string;

    @Column({ nullable: true, type: 'date' })
    ficha_data_inicio: Date;

    @Column({ nullable: true, type: 'date' })
    ficha_data_fim: Date;

    @Column({ nullable: true })
    objetivo: string;

    @Column({ nullable: true })
    instrutor_id: number;

    @Column({ nullable: true })
    team_member_id: string;

    @Column({ nullable: true, default: true })
    fl_ativo: boolean;

    @Column({ nullable: true, type: 'real' })
    peso_inicial: number;

    @Column({ nullable: true, type: 'real' })
    peso_meta: number;

    @OneToMany(() => FichaSessaoEntity, (sessao) => sessao.ficha)
    sessoes: FichaSessaoEntity[];
}

