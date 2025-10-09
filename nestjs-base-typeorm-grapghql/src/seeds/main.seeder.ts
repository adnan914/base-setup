/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { User } from '../typeorm/entities/user.entity';
import { Attendance } from './../typeorm/entities/attendence.entity';
import { AttendanceUser } from './../typeorm/entities/attendance_user.entity';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const attendanceUserRepository = dataSource.getRepository(AttendanceUser);

    const userFactory = factoryManager.get(User);
    const attendanceFactory = factoryManager.get(Attendance);
    const userAttendanceFactory = factoryManager.get(AttendanceUser);

    const users = await userFactory.saveMany(7);
    const attendance = await attendanceFactory.saveMany(10);
    const attendanceUser = await Promise.all(
      Array(10)
        .fill('')
        .map(async () => {
          const made = await userAttendanceFactory.make({
            user: faker.helpers.arrayElement(users),
            attendance: faker.helpers.arrayElement(attendance),
            markedBy: faker.helpers.arrayElement(users),
          });
          console.log(made);
          return made;
        }),
    );
    await attendanceUserRepository.save(attendanceUser);
  }
}
