/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('usuario')
export class UsuarioEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    nome: string;

    @Column({ nullable: true, type: 'double precision' })
    peso: number;

    @Column({ unique: true })
    cpf: string;

    @Column({ nullable: true, unique: true })
    whatsapp: string;

    @Column({ nullable: true })
    plano: number;

    @Column({ nullable: true })
    senha: string;

    @Column({ nullable: true, default: true })
    fl_ativo: boolean;

    @Column({ nullable: true })
    foto_url: string;

    @Column({ nullable: true })
    avc: boolean;

    @Column({ nullable: true })
    dac: boolean;

    @Column({ nullable: true })
    diabete: boolean;

    @Column({ nullable: true })
    pressao_arterial: string;

    @Column({ nullable: true })
    cardiopata: boolean;

    @Column({ nullable: true })
    infarto: boolean;

    @Column({ nullable: true })
    genero: string;

    @Column({ nullable: true })
    fumante: boolean;

    @Column({ nullable: true })
    tipo_alimentacao: string;

    @Column({ nullable: true })
    relato_dor: string;

    @Column({ nullable: true })
    medicacao_em_uso: string;

    @Column({ nullable: true })
    profissao: string;

    @Column({ nullable: true })
    fl_pratica_atividade_fisica: boolean;

    @Column({ nullable: true })
    objetivo: string;

    @Column({ type: 'date' })
    data_nascimento: Date;

    @Column({ nullable: true })
    flagAdmin: boolean;

    @Column({ nullable: true, type: 'smallint' })
    tipo_usuario: number;

    @Column({ nullable: true, type: 'real' })
    altura: number;

    @Column({ nullable: true })
    doencas: string;

    @Column({ nullable: true })
    horario_id: number;

    @Column({ nullable: true, type: 'real' })
    imc: number;

    @Column({ nullable: true, type: 'real' })
    rcq: number;

    @Column({ nullable: true, type: 'smallint' })
    data_vencimento: number;

    @Column({ nullable: true })
    observacoes: string;

    @Column({ nullable: true, type: 'smallint' })
    classificacao_risco: number;

    @Column({ nullable: true })
    cirurgia: string;

    @Column({ nullable: true, type: 'uuid' })
    empresa_id: string;

    @Column({ nullable: true })
    instagram_username: string;

    @Column({ nullable: true })
    fl_usa_app: boolean;

    @Column({ nullable: true, type: 'timestamptz' })
    data_ultimo_pagamento: Date;

    @Column({ nullable: true })
    cip: string;

    @Column({ nullable: true, type: 'timestamptz' })
    data_desativacao: Date;

    @Column({ default: '' })
    email: string;

    @Column({ nullable: true, unique: true })
    cref: string;

    @Column({ nullable: true })
    especialidade: string;

    @Column({ nullable: true })
    funcao: string;

    @Column({ nullable: true })
    turno: string;
}
