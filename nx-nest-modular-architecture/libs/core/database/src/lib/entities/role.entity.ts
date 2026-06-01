import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { RoleModulePermission } from "./role-module-permissions.entity";
import { User } from "./user.entity";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RoleModulePermission, (rmp) => rmp.role)
  permissions: RoleModulePermission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
