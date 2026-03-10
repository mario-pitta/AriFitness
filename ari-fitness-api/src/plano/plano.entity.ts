/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('planos')
export class PlanoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    descricao: string;

    @Column({ type: 'smallint' })
    qtd_dias_semana: number;

    @Column({ default: true })
    fl_ativo: boolean;

    @Column({ nullable: true, type: 'real' })
    preco_padrao: number;

    @Column({ nullable: true, type: 'uuid' })
    empresa_id: string;

    @Column({ nullable: true })
    caracteristicas: string;
}
