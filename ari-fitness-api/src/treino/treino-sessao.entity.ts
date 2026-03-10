/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    JoinColumn,
} from 'typeorm';
import { TreinoEntity } from './treino.entity';
import { TreinoExercicioEntity } from './treino-exercicio.entity';

@Entity('treino_sessao')
@Index('idx_treino_sessao_treino_id', ['treino_id'])
export class TreinoSessaoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    treino_id: number;

    /** Nome da sessão: A, B, C, D, E ou F */
    @Column({ type: 'varchar', length: 10 })
    nome: string;

    @Column({ type: 'smallint' })
    ordem: number;

    // ─── Relações TypeORM (para queries via QueryBuilder / migrations) ───

    @ManyToOne(() => TreinoEntity, (treino) => treino.sessoes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'treino_id' })
    treino: TreinoEntity;

    @OneToMany(() => TreinoExercicioEntity, (ex) => ex.sessao)
    exercicios: TreinoExercicioEntity[];
}
