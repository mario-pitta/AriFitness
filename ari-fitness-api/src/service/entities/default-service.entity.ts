import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('default_services')
export class DefaultService {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nome: string;

    @Column({ nullable: true })
    descricao: string;

    @Column({ nullable: true })
    icone: string;

    @Column({ name: 'fl_ativo', default: true })
    fl_ativo: boolean;
}
