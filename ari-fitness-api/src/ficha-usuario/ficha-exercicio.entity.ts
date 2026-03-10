/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
} from 'typeorm';
import { FichaSessaoEntity } from './ficha-sessao.entity';
import { TipoExecucao, TipoProgressao } from '../treino/treino-enums';

@Entity('ficha_exercicio')
export class FichaExercicioEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    ficha_sessao_id: number;

    @Column()
    exercicio_id: number;

    @Column({ type: 'smallint', nullable: true })
    series: number;

    @Column({ nullable: true })
    repeticoes: number;

    @Column({ type: 'numeric', nullable: true })
    carga: number;

    @Column({ nullable: true })
    intervalo: number;

    @Column({ type: 'smallint' })
    ordem: number;

    @Column({ type: 'smallint', default: TipoExecucao.NORMAL })
    tipo_execucao: number;

    @Column({ type: 'smallint', nullable: true })
    grupo_execucao: number;

    @Column({ type: 'smallint', default: TipoProgressao.NORMAL })
    tipo_progressao: number;

    /** Detalhamento de carga por série (ex: [10, 12, 14, 16]) */
    @Column({ type: 'jsonb', nullable: true })
    carga_series: any;

    // ─── Relações TypeORM ───

    @ManyToOne(() => FichaSessaoEntity, (sessao) => sessao.exercicios, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ficha_sessao_id' })
    sessao: FichaSessaoEntity;
}
