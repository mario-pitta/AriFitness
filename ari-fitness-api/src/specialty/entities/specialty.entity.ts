import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('specialty')
export class Specialty {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    created_at: Date;

    @Column({ type: 'date' })
    updated_at: Date;

    @Column()
    nome: string;
}
