/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tipo_usuario')
export class TipoUsuarioEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    nome: string;

    @Column({ nullable: true, default: false })
    adm_padrao: boolean;

    @Column({ nullable: true, type: 'real' })
    salario_padrao: number;

    @Column({ default: true })
    fl_ativo: boolean;
}
