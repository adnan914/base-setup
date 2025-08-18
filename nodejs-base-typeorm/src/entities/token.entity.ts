import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TokenType } from '@/enums'; // <-- safer than '@/enums'

@Entity({ name: 'tokens' })
export class Token {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: false })
    token: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    // optional if you want direct access
    // @Column()
    // userId: string;

    @Column({ type: 'boolean', default: false })
    used: boolean;

    @Column({ type: 'enum', enum: TokenType })
    type: TokenType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
