/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('musculo')
export class MusculoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true, unique: true })
    nome: string;

    @Column({ type: 'smallint' })
    parte_do_corpo_id: number;

    @Column({ type: 'smallint' })
    grupo_muscular_id: number;

    @Column({ nullable: true })
    funcao: string;

    @Column({ nullable: true })
    principais_exercicios: string;

    @Column({ nullable: true })
    midia_url: string;

    @Column({ nullable: true, default: true })
    fl_ativo: boolean;
}
