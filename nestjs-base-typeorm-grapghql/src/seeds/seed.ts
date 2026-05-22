import { config } from 'dotenv';
config();
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { User } from '../typeorm/entities/user.entity';
import { Attendance } from './../typeorm/entities/attendence.entity';
import { AttendanceUser } from './../typeorm/entities/attendance_user.entity';
import { UsersFactory } from './factories/user.factory';
import { AttendanceFactory } from './factories/attendance.factory';
import { AttendanceUserFactory } from './factories/attendance_user.factory';
import { MainSeeder } from './main.seeder';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, Attendance, AttendanceUser],
  //synchronize: true,
  factories: [UsersFactory, AttendanceFactory, AttendanceUserFactory],
  seeds: [MainSeeder],
};

const dataSource = new DataSource(options);

dataSource.initialize().then(async () => {
  await dataSource.synchronize(true);
  try {
    await runSeeders(dataSource);
    console.log('Seed ran successfully.');
  } catch (error) {
    console.error('Seed failed:', error);
  }
  process.exit();
});
