/* eslint-disable @typescript-eslint/no-unused-vars */
import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { AttendanceUser } from '../../typeorm/entities/attendance_user.entity';

export const AttendanceUserFactory = setSeederFactory(
  AttendanceUser,
  (faker: Faker) => {
    const attendanceUser = new AttendanceUser();
    return attendanceUser;
  },
);
