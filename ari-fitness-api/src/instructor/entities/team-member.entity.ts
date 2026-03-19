import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Specialty } from '../../specialty/entities/specialty.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('team_member')
export class TeamMember {
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

    @Column({ nullable: true })
    cpf: string;

    @Column({ nullable: true })
    ctps: string;

    @Column({ nullable: true })
    cref: string;

    @Column({ nullable: true })
    password: string;

    @Column({ type: 'bigint', nullable: true })
    function_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ nullable: true })
    genero: string;

    @ManyToMany(() => Specialty, { cascade: true, eager: true })
    @JoinTable({
        name: 'instructor_specialties', // Keeping join table names as they exist unless told otherwise
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
