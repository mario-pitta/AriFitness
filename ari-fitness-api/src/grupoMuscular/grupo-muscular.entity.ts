/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('grupo_muscular')
export class GrupoMuscularEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ unique: true })
    nome: string;

    @Column({ nullable: true, type: 'smallint' })
    parte_do_corpo_id: number;

    @Column({ nullable: true })
    midia_url: string;

    @Column({ nullable: true, default: true })
    fl_ativo: boolean;
}
