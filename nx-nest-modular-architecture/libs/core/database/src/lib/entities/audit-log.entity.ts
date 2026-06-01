import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  @Index()
  service_name: string;

  @Column({ type: "varchar", length: 100 })
  @Index()
  module: string;

  @Column({ type: "varchar", length: 100 })
  @Index()
  entity_type: string;

  @Column({ type: "uuid", nullable: true })
  @Index()
  entity_id: string | null;

  @Column({ type: "varchar", length: 50 })
  @Index()
  action: string;

  @Column({ type: "text", nullable: true })
  message: string | null;

  @Column({ type: "uuid", nullable: true })
  @Index()
  performed_by_user_id: string | null;

  @Column({ type: "varchar", length: 150, nullable: true })
  performed_by_email: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  performed_by_role: string | null;

  @Column({ type: "jsonb", nullable: true })
  target_snapshot_jsonb: Record<string, unknown> | null;

  @Column({ type: "jsonb", nullable: true })
  changes_jsonb: Record<string, unknown> | null;

  @Column({ type: "jsonb", nullable: true })
  meta_jsonb: Record<string, unknown> | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  ip_address: string | null;

  @Column({ type: "text", nullable: true })
  user_agent: string | null;

  @CreateDateColumn()
  @Index()
  created_at: Date;
}
