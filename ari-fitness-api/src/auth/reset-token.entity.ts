/* eslint-disable prettier/prettier */
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reset_tokens')
export class ResetTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    user_id: number;

    @Column({ nullable: true })
    token: string;

    @Column({ nullable: true, type: 'date' })
    expires_at: Date;
}
