/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tipo_transacao_financeira')
export class TipoTransacaoFinanceiraEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    descricao: string;

    @Column({ nullable: true, default: true })
    fl_ativo: boolean;
}
