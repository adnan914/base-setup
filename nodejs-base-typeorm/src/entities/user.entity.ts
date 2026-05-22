import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeUpdate,
} from 'typeorm';
import { Role, Status } from '@/enums';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @Column({ type: 'varchar', length: 100 })
    lastName: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ type: 'varchar', select: false })
    password: string;

    @Column({ type: 'enum', enum: Role })
    role: Role;

    @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
    status: Status;

    @Column({ type: 'varchar', nullable: true })
    profileImg?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Pre-update hook to set updatedAt manually (optional, TypeORM handles it automatically)
    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }

    // Optional: hide password when serializing to JSON
    toJSON() {
        const { password, ...rest } = this;
        return rest;
    }
}
