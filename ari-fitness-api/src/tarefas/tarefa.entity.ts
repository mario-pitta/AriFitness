/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tarefa')
export class TarefaEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    titulo: string;

    @Column({ nullable: true })
    descricao: string;

    @Column({ nullable: true })
    tipo_tarefa_id: number;

    @Column()
    status_tarefa_id: number;

    @Column({ nullable: true })
    criado_por: number;

    @Column({ type: 'uuid' })
    empresa_id: string;

    @Column({ nullable: true, type: 'timestamptz' })
    data_limite_conclusao: Date;

    @Column({ type: 'smallint', default: 0 })
    prioridade: number;

    @Column({ nullable: true, default: true })
    fl_ativo: boolean;

    @Column()
    posicao: number;
}
