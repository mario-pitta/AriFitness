import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PedidoEntity } from './pedido.entity';
import { ProdutoEntity } from '../produto/produto.entity';

@Entity('pedido_itens')
export class PedidoItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'pedido_id', type: 'uuid' })
  pedido_id: string;

  @ManyToOne(() => PedidoEntity, pedido => pedido.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: PedidoEntity;

  @Column({ name: 'produto_id', type: 'uuid' })
  produto_id: string;

  @ManyToOne(() => ProdutoEntity)
  @JoinColumn({ name: 'produto_id' })
  produto: ProdutoEntity;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ name: 'preco_unitario', type: 'decimal', precision: 10, scale: 2 })
  preco_unitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  desconto: number;
}