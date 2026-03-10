/* eslint-disable prettier/prettier */
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('checkin_acesso')
export class CheckinAcessoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cpf_aluno: string;

    @Column({ type: 'uuid' })
    empresa_id: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    data_hora: Date;

    @Column({ nullable: true, type: 'date' })
    data_checkin: Date;

    @Column({ nullable: true, type: 'time' })
    hora_checkin: string;

    @Column({ nullable: true })
    nome: string;
}
