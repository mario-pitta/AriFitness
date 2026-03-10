/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    JoinColumn,
} from 'typeorm';
import { FichaAlunoEntity } from './ficha-aluno.entity';
import { FichaExercicioEntity } from './ficha-exercicio.entity';

@Entity('ficha_sessao')
export class FichaSessaoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    ficha_id: number;

    /** Nome da sessão: A, B, C, D, E ou F */
    @Column({ type: 'varchar', length: 10 })
    nome: string;

    @Column({ type: 'smallint' })
    ordem: number;

    // ─── Relações TypeORM ───

    @ManyToOne(() => FichaAlunoEntity, (ficha) => ficha.sessoes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ficha_id' })
    ficha: FichaAlunoEntity;

    @OneToMany(() => FichaExercicioEntity, (ex) => ex.sessao)
    exercicios: FichaExercicioEntity[];
}
