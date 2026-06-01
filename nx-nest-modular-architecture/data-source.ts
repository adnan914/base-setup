import { DataSource } from "typeorm";
import { config } from "dotenv";
config();

const isProd = process.env.NODE_ENV === "production";

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: isProd ? ["dist/**/*.entity.js"] : ["libs/**/*.entity.ts"],
  migrations: isProd ? ["dist/migrations/*.js"] : ["migrations/*.ts"],
  synchronize: false,
  logging: true,
});
