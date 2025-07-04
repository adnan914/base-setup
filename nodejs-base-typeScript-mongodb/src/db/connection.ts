import mongoose from 'mongoose';

export class Database {
    static init(db_url: string): void {
        if (!db_url) {
            throw new Error('DB connection is not defined!');
        }

        mongoose.connect(db_url)
            .then(() => {
                console.log('Connected to the database.');
            })
            .catch((err) => {
                console.error('MongoDB connection error:', err);
            });
    }
}
