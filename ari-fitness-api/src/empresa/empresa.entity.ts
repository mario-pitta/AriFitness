/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('empresa')
export class EmpresaEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    nome_fantasia: string;

    @Column({ nullable: true })
    cnpj: string;

    @Column({ nullable: true })
    logo_url: string;

    @Column({ nullable: true })
    banner_url: string;

    @Column({ nullable: true, default: true })
    flag_ativo: boolean;

    @Column({ nullable: true, type: 'smallint' })
    subscription_plan_id: number;

    @Column({ nullable: true })
    default_theme: string;

    @Column({ nullable: true })
    nome: string;

    @Column({ nullable: true })
    telefone: string;

    @Column({ nullable: true, unique: true })
    email: string;

    @Column({ nullable: true })
    primary_color_hex: string;

    @Column({ default: true })
    accept_pix: boolean;

    @Column({ default: true })
    accept_credit_card: boolean;

    @Column({ default: true })
    accept_debit_card: boolean;

    @Column({ default: true })
    accept_money_in_cash: boolean;

    @Column({ nullable: true })
    chave_pix: string;

    @Column({ nullable: true })
    openai_key: string;

    @Column({ nullable: true })
    meta_key: string;

    @Column({ nullable: true, type: 'smallint', default: 1 })
    pgmto_credito_max_parcelas: number;

    @Column({ nullable: true, type: 'timestamptz' })
    deleted_at: Date;

    @Column({ nullable: true, type: 'timestamptz' })
    updated_at: Date;
}
