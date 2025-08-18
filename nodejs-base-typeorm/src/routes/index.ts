import { Express } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

export class Routes {
    static initRoutes(app: Express, version: string) {
        app.use(`/${version}/auth`, authRoutes);
        app.use(`/${version}/user`, userRoutes);
    }
}