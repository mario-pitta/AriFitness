import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('integracao_whatsapp')
export class IntegracaoWhatsapp {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    empresa_id: string;

    @Column({ type: 'text', nullable: true })
    instancia_token: string;

    @Column({ type: 'boolean', default: true })
    fl_ativo: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
