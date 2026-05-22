/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
// Define the DayOfWeek enum
export enum DayOfWeek {
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
}
// Register the DayOfWeek enum with GraphQL
registerEnumType(DayOfWeek, {
  name: 'DayOfWeek',
});
@Entity({ name: 'attendance' })
@ObjectType()
export class Attendance {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;
  @Column({ type: 'date' })
  @Field()
  date: Date;
  @Column({ type: 'enum', enum: DayOfWeek })
  @Field((type) => DayOfWeek)
  dayOfWeek: DayOfWeek;
  @CreateDateColumn()
  @Field()
  created_at: Date;
}
