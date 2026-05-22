// src/database/Database.ts
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppError, MessageUtil, StatusUtil } from '@/utils';

export class Database {
    private static instance: Database;
    public dataSource: DataSource;

    private constructor() {
        process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';
        dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });

        this.validateEnv();

        const isDev = process.env.NODE_ENV === 'development';

        const commonConfig = {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT ?? '5432'),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            logging: isDev,
            synchronize: false
        };

        const migrationConfig = {
            ...commonConfig,
            entities: ['dist/entities/**/*{.ts,.js}'],
            migrations: ['dist/migrations/*{.ts,.js}'],
            autoLoadEntities: true
        };
        this.dataSource = new DataSource(migrationConfig as DataSourceOptions);
    }

    // Singleton instance
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    // Environment validation
    private validateEnv() {
        const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME'];
        requiredEnvVars.forEach((envVar) => {
            if (!process.env[envVar]) {
                throw new AppError(`${envVar} ${MessageUtil.ENV_NOT_FOUND}`, StatusUtil.INTERNAL_SERVER_ERROR);
            }
        });
    }

    // Initialize database
    public async initialize(): Promise<void> {
        try {
            await this.dataSource.initialize();
        } catch (err) {
            throw new AppError(MessageUtil.DB_CONNECTION_ERROR, StatusUtil.INTERNAL_SERVER_ERROR);
        }
    }
}
