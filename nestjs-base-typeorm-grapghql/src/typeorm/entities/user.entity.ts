/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  Employee = 'employee',
  Lead = 'lead',
  Manager = 'manager',
  Admin = 'admin',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@Entity({ name: 'users' })
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @Column({ nullable: false })
  @Field()
  first_name: string;

  @Column({ nullable: false })
  @Field()
  last_name: string;

  @Column({ unique: true, nullable: false })
  @Field()
  email: string;

  @Column({ nullable: false })
  password: string;

  @CreateDateColumn()
  @Field()
  terms_agreed_at: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  photo_url: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  verified: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  verification_token: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bio: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
    default: UserRole.Employee,
  })
  @Field(() => UserRole, { nullable: true })
  role: UserRole;

  @Column({ nullable: true })
  @Field({ nullable: true })
  reset_password_token: string;

  @CreateDateColumn({ nullable: true })
  @Field()
  reset_password_sent_at: Date;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  cust_id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  cust_card_id: string;
    entries: any;
}
