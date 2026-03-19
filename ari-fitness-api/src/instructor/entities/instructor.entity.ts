import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Specialty } from '../../specialty/entities/specialty.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('instructor')
export class Instructor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    empresa_id: string;

    @Column({ type: 'int', nullable: true })
    user_id: number;

    @Column()
    nome: string;

    @Column({ nullable: true })
    telefone: string;

    @Column({ nullable: true })
    foto_url: string;

    @Column({ type: 'varchar', default: 'ACTIVE' })
    status: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    salario: number;

    /** [{ dia: 'seg', inicio: 8, saida: 17 }] */
    @Column({ type: 'jsonb', nullable: true, default: '[]' })
    dias_horas_trabalho: { dia: string; inicio: number; saida: number }[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToMany(() => Specialty, { cascade: true, eager: true })
    @JoinTable({
        name: 'instructor_specialties',
        joinColumn: { name: 'instructor_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'specialty_id', referencedColumnName: 'id' }
    })
    specialties: Specialty[];

    @ManyToMany(() => Service, { cascade: true, eager: true })
    @JoinTable({
        name: 'instructor_services',
        joinColumn: { name: 'instructor_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' }
    })
    services: Service[];
}
