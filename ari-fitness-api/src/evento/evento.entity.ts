/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('evento')
export class EventoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true, type: 'date' })
    data_inicio: Date;

    @Column({ nullable: true, type: 'date' })
    data_fim: Date;

    @Column({ nullable: true, type: 'timetz' })
    hora_inicio: string;

    @Column({ nullable: true, type: 'timetz' })
    hora_fim: string;

    @Column({ nullable: true })
    local: string;

    @Column({ nullable: true })
    descricao: string;

    @Column({ type: 'uuid' })
    empresa_id: string;

    @Column({ nullable: true })
    criado_por: number;

    @Column({ nullable: true })
    tipo_evento_id: number;

    @Column({ nullable: true })
    banner: string;

    @Column()
    titulo: string;

    @Column({ nullable: true })
    status_evento_id: number;

    @Column({ default: true })
    fl_ativo: boolean;

    @Column({ default: true })
    fl_publico: boolean;
}
