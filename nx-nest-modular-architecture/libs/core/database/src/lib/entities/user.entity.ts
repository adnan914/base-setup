import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { Role } from "./role.entity";
import { Status } from "@lib/core/common";

@Entity("users")
@Unique("uq_users_email_lower", ["email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "role_id" })
  role: Role;

  @Column()
  name: string;

  @Column()
  @Index()
  email: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  phone: string | null;

  @Column({ type: "text", nullable: true })
  profile_image_url: string | null;

  @Column({ type: "text", nullable: true })
  password: string | null;

  @Column({ type: "timestamp", nullable: true })
  email_verified_at: Date | null;

  @Column({ type: "timestamp", nullable: true })
  last_login_at: Date | null;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column({ type: "uuid", nullable: true })
  created_by: string | null;

  @Column({ type: "uuid", nullable: true })
  updated_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

}
