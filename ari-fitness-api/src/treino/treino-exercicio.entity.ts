/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { TreinoSessaoEntity } from './treino-sessao.entity';
import { TipoExecucao, TipoProgressao } from './treino-enums';


@Entity('treino_exercicio')
export class TreinoExercicioEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    exercicio_id: number;

    @Column()
    treino_id: number;

    @Column({ nullable: true })
    grupo_muscular_id: number;

    @Column({ nullable: true })
    parte_do_corpo_id: number;

    @Column({ nullable: true })
    carga: number;

    @Column({ nullable: true, type: 'smallint' })
    series: number;

    @Column({ nullable: true })
    repeticoes: number;

    @Column({ nullable: true })
    intervalo: number;

    @Column({ nullable: true })
    equipamento_id: number;

    @Column({ nullable: true })
    sessao_id: number;

    @Column({ type: 'smallint', nullable: true })
    ordem: number;

    @Column({ type: 'smallint', default: TipoExecucao.NORMAL })
    tipo_execucao: number;

    @Column({ type: 'smallint', nullable: true })
    grupo_execucao: number;

    @Column({ type: 'smallint', default: TipoProgressao.NORMAL })
    tipo_progressao: number;

    @Column({ type: 'jsonb', nullable: true })
    carga_series: any;

    // ─── Relações ───

    @ManyToOne(() => TreinoSessaoEntity, (sessao) => sessao.exercicios, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sessao_id' })
    sessao: TreinoSessaoEntity;
}

