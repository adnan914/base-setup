// src/database/AppDataSource.ts
import { Database } from './database';

const db = Database.getInstance();

// Initialize database immediately
export const AppDataSource = db.dataSource;

export const initializeDatabase = async () => {
    await db.initialize();
};

