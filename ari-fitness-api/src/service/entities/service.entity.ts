import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('service')
export class Service {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    empresa_id: string;

    @Column()
    nome: string;

    @Column({ nullable: true })
    descricao: string;

    @Column({ default: true })
    ativo: boolean;
}
