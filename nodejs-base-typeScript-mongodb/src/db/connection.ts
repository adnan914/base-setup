import mongoose from 'mongoose';
import { AppError, MessageUtil, StatusUtil } from '@/utils';

export class Database {
    static init(db_url: string): void {
        if (!db_url) throw new AppError(MessageUtil.DB_CONNECTION_ERROR, StatusUtil.INTERNAL_SERVER_ERROR);

        mongoose.connect(db_url)
            .then(() => {
                console.log(MessageUtil.DB_CONNECTION);
            })
            .catch((err) => {
                console.error(MessageUtil.MONGO_CONNECTION_ERROR, err);
            });
    }
}
