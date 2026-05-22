import 'module-alias/register';
import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV}` });
import cors from "cors";
import express from "express";
import helmet from 'helmet';
import path from 'path';
import { Database } from "@/db/connection";
import { Routes } from "@/routes";
import { globalLimiter } from "@/middleware/rate.limiting.middleware";
import { globalErrorHandler } from '@/middleware/error.handler.middleware';

const app = express();

async function bootstrap() {
  try {


    Database.init(process.env.DB_URL as string);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/static', express.static(path.join(__dirname, 'public')));
    app.use(cors());
    app.use(globalLimiter);
    app.use(helmet());
    app.options("*", cors());

    Routes.initRoutes(app, 'api/v1');

    app.get("/", (req, res) => {
      res.json("Hello, World!");
    });

    app.use(globalErrorHandler);

    if (process.env.NODE_ENV !== 'test') {
      app.listen(process.env.PORT, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
      });
    }
  } catch (err) {
    console.error("Error during App initialization", err);
    process.exit(1);
  }
}

bootstrap();

export default app;