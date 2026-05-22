/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Attendance } from './attendence.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@Entity({ name: 'attendance_user' })
@ObjectType()
export class AttendanceUser {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => Attendance)
  @JoinColumn({ name: 'attendance_id', referencedColumnName: 'id' })
  @Field(() => Attendance)
  attendance: Attendance;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'marked_by' })
  @Field(() => User, { nullable: true })
  markedBy: User | null;
}
