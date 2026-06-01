import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { RoleModulePermission } from "./role-module-permissions.entity";

@Entity("modules")
export class Module {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RoleModulePermission, (rmp) => rmp.module)
  permissions: RoleModulePermission[];
}
