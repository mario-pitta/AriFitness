import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PedidoItemEntity } from './pedido-item.entity';

@Entity('pedidos')
export class PedidoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresa_id: string;

  @Column({ name: 'cliente_id', type: 'uuid', nullable: true })
  cliente_id: string;

  @Column({ name: 'cliente_nome', type: 'text', nullable: true })
  cliente_nome: string;

  @Column({ name: 'cliente_telefone', type: 'text', nullable: true })
  cliente_telefone: string;

  @Column({ name: 'cliente_email', type: 'text', nullable: true })
  cliente_email: string;

  @Column({ name: 'valor_total', type: 'decimal', precision: 10, scale: 2 })
  valor_total: number;

  @Column({ name: 'valor_desconto', type: 'decimal', precision: 10, scale: 2, default: 0 })
  valor_desconto: number;

  @Column({ type: 'text', default: 'pendente' })
  status: string;

  @Column({ name: 'forma_pagamento', type: 'text', nullable: true })
  forma_pagamento: string;

  @Column({ name: 'pago_em', type: 'timestamp with time zone', nullable: true })
  pago_em: Date;

  @Column({ type: 'text', nullable: true })
  obs: string;

  @Column({ name: 'fl_ativo', type: 'boolean', default: true })
  fl_ativo: boolean;

  @OneToMany(() => PedidoItemEntity, item => item.pedido)
  itens: PedidoItemEntity[];
}