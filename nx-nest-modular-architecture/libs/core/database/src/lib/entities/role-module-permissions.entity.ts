import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn,
  Index,
} from "typeorm";
import { Role } from "./role.entity";
import { Module } from "./module.entity";

@Entity("role_module_permissions")
@Unique(["role", "module"])
export class RoleModulePermission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Role, (role) => role.permissions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  @Index()
  role: Role;

  @ManyToOne(() => Module, (m) => m.permissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "module_id" })
  module: Module;

  @Column({ default: false })
  access_allowed: boolean;
}
