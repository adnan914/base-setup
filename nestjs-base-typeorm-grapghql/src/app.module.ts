import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UsersModule } from './module/users/users.module';
import { AuthModule } from './module/auth/auth.module';
import { AttendanceModule } from './module/attendance/attendance.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AttendanceUserModule } from './module/attendance_user/attendance_user.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigController } from './module/config/config.controller';
import { LibsModule } from './lib/Utils/lib.module';
import { ConstantModule } from './lib/constant/constant.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    AttendanceModule,
    AttendanceUserModule,
    LibsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ConstantModule
  ],
  controllers: [ConfigController],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
