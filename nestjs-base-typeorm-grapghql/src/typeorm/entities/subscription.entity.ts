/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    Index,
  } from 'typeorm';
  import { ObjectType, Field } from '@nestjs/graphql';
  import { User } from './user.entity';
  export enum SubscriptionType {
    Plus = 'Plus',
    Basic = 'Basic',
  }
  
  export enum SubscriptionActiveStatus {
    Active = 'active',
    Inactive = 'inactive',
    Deleted = 'deleted',
  }
  
  @Entity({ name: 'subscription' })
  @ObjectType()
  export class Subscription {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;
     

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @Field((type) => User)
    user: User;
  
    @Column()
    @Field()
    expires_date_ms: number;
  
    @Column({ default: true })
    @Field()
    is_trial_period: boolean;
  
    @Column()
    @Field()
    purchase_date_ms: number;
  
    @Column({
      type: 'enum',
      enum: SubscriptionType,
      default: SubscriptionType.Basic,
    })
    @Field(() => SubscriptionType)
    type: SubscriptionType;
  
    @Column()
    @Field()
    product_id: string;
  
    @Column()
    @Field()
    transaction_id: string;
  
    @Column('jsonb')
    @Field((type) => Object)
    meta: Record<string, any>;
  
    @Column({
      type: 'enum',
      enum: SubscriptionActiveStatus,
      default: SubscriptionActiveStatus.Active,
    })
    @Field(() => SubscriptionActiveStatus)
    active_status: SubscriptionActiveStatus;
  
    @CreateDateColumn()
    @Field()
    created_at: Date;
  
    @CreateDateColumn()
    @Field()
    updated_at: Date;
  }
