/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categoria_transacao_financeira')
export class CategoriaTransacaoFinanceiraEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    descricao: string;

    @Column()
    tr_tipo_id: number;

    @Column({ default: true })
    fl_ativo: boolean;
}
