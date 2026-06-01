import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { TokenType } from "@lib/core/common";

@Entity({ name: "tokens" })
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  token: string;

  @Column()
  user_id: string;

  @Column({ type: "timestamp", nullable: true })
  expires_at: Date | null;

  @Column({ type: "boolean", default: false })
  used: boolean;

  @Column({ type: "enum", enum: TokenType })
  type: TokenType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Token;
