/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
  import { User } from './user.entity'; 

  export enum DeviceType {
    Web = 'web',
    Android = 'android',
    IOS = 'ios',
  }
  registerEnumType(DeviceType, {
    name: 'DeviceType',
  });
  @Entity({ name: 'user_device' }) 
  @ObjectType()
  export class UserEntry {
    @PrimaryGeneratedColumn()
    @Field((type) => Int)
    id: number;
    @Column({
      type: 'enum',
      enum: DeviceType,
      nullable: false,
    })
    @Field(() => DeviceType)
    type: DeviceType;
    @Column({ nullable: false })
    @Field()
    device_token: string;
    @Column({ nullable: false })
    @Field()
    user_id: number;
    @ManyToOne(() => User,{nullable:true})
    @JoinColumn({ name: 'user_id' })
    @Field(() => User)
    user: User;
    @CreateDateColumn()
    @Field()
    created_at: Date;
  }