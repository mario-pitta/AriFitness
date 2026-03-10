/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transacao_financeira')
export class TransacaoFinanceiraEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'timestamptz' })
    data_lancamento: Date;

    @Column({ type: 'double precision' })
    valor_real: number;

    @Column({ type: 'double precision' })
    valor_final: number;

    @Column({ nullable: true, type: 'double precision', default: 0 })
    desconto_perc: number;

    @Column({ nullable: true, type: 'double precision', default: 0 })
    desconto_real: number;

    @Column({ nullable: true, type: 'uuid' })
    produto_id: string;

    @Column({ nullable: true, type: 'uuid' })
    servico_id: string;

    @Column({ nullable: true, type: 'double precision' })
    quantidade: number;

    @Column({ nullable: true, type: 'smallint' })
    mes: number;

    @Column({ nullable: true, type: 'smallint' })
    ano: number;

    @Column({ type: 'uuid' })
    empresa_id: string;

    @Column()
    forma_pagamento: string;

    @Column({ default: false })
    fl_pago: boolean;

    @Column({ nullable: true })
    descricao: string;

    @Column({ nullable: true })
    comprovante_url: string;

    @Column({ nullable: true })
    pago_por: number;

    @Column({ nullable: true })
    tr_categoria_id: number;

    @Column({ nullable: true })
    tr_tipo_id: number;

    @Column({ nullable: true })
    recebido_por: number;

    @Column({ default: true })
    fl_ativo: boolean;

    @Column({ nullable: true, type: 'uuid' })
    auth_code: string;
}
