import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import {
  Attendance,
  DayOfWeek,
} from '../../typeorm/entities/attendence.entity';

export const AttendanceFactory = setSeederFactory(
  Attendance,
  (faker: Faker) => {
    const attendance = new Attendance();
    attendance.date = faker.date.recent();
    attendance.dayOfWeek = faker.helpers.arrayElement(Object.values(DayOfWeek));
    attendance.created_at = faker.date.past();
    return attendance;
  },
);
