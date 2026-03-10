/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('horarios')
export class HorarioEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'time' })
    hora_inicio: string;

    @Column({ type: 'time' })
    hora_fim: string;

    @Column({ default: true })
    fl_ativo: boolean;

    @Column({ nullable: true, type: 'uuid' })
    empresa_id: string;
}
