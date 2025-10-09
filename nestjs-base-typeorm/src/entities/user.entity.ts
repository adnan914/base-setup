import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole, UserStatus } from '@/shared/enums';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ select: false })
  password: string;

  @Column('simple-array')
  roles: UserRole[];

  @Index()
  @Column({ type: 'varchar', default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true, select: false })
  refreshToken?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export default UserEntity;
