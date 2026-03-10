/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('equipamentos')
export class EquipamentoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true, unique: true })
    nome: string;

    @Column({ nullable: true })
    foto_url: string;

    @Column({ nullable: true })
    midia_url: string;

    @Column({ nullable: true })
    categoria_id: number;

    @Column({ default: true })
    fl_ativo: boolean;

    @Column({ nullable: true, type: 'uuid' })
    empresa_id: string;
}
