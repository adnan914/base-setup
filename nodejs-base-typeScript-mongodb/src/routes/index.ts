import { Express } from 'express';
import authRoutes from './auth.routes';
import transcriptRoutes from './transcript.routes';

export class Routes {
    static initRoutes(app: Express, version: string) {
        app.use(`/${version}`, authRoutes);
        app.use(`/${version}`, transcriptRoutes);
    }
}