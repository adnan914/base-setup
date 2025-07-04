import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';

dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`${envVar} is not defined in the environment`);
    }
});

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const commonConfig = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432'), // Ensure DB_PORT is a number
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    logging: isDevelopment,
    synchronize: false
};

const migrationConfig = {
    ...commonConfig,
    entities: [isProduction ? 'dist/entities/**/*{.ts,.js}' : 'src/entities/**/*{.ts,.js}'],
    migrations: [isProduction ? 'dist/migrations/*{.ts,.js}' : 'src/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
};

const AppDataSource = new DataSource(migrationConfig as DataSourceOptions);
// Use async/await for better error handling
const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connection established successfully!");
    } catch (err) {
        console.error("Error during database connection!", err);
    }
};

initializeDatabase();

export { AppDataSource };