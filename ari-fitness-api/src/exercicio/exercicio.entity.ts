/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('exercicios')
export class ExercicioEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ unique: true })
    nome: string;

    @Column({ nullable: true })
    equipamento_id: number;

    @Column({ nullable: true })
    grupo_muscular_id: number;

    @Column({ nullable: true })
    musculo_id: number;

    @Column({ default: true })
    fl_ativo: boolean;

    @Column({ nullable: true })
    midia_url: string;

    @Column({ nullable: true, type: 'uuid' })
    empresa_id: string;
}
