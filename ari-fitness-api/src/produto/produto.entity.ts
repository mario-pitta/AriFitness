import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('produtos')
export class ProdutoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresa_id: string;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @Column({ type: 'int', default: 0 })
  estoque: number;

  @Column({ name: 'estoque_minimo', type: 'int', default: 5 })
  estoque_minimo: number;

  @Column({ name: 'imagem_url', type: 'text', nullable: true })
  imagem_url: string;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ type: 'text', nullable: true })
  categoria: string;
}