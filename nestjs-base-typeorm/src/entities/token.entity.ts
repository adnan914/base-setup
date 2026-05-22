import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TokenType } from '@/shared/enums';

@Entity({ name: 'tokens' })
export class TokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  token: string;

  @Column()
  userId: string;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'enum', enum: TokenType })
  type: TokenType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default TokenEntity;
