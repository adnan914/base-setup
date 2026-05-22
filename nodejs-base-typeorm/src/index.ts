import 'module-alias/register';
import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` });
import cors from "cors";
import express from "express";
import helmet from 'helmet';
import path from 'path';
import { initializeDatabase } from "@/config/app.data.source";
import { Routes } from "@/routes";
import { globalLimiter } from "@/middleware/rate.limiting.middleware";
import { globalErrorHandler } from '@/middleware/error.handler.middleware';

async function bootstrap() {
  try {
    await initializeDatabase();
    console.log("Database connected!");

    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(cors());
    app.use(globalLimiter);
    app.use(helmet());
    app.options("*", cors());

    // Root route
    app.get("/", (req, res) => {
      res.json("Hello, World!");
    });

    Routes.initRoutes(app, 'api/v1');

    app.use(globalErrorHandler);

    // Server start
    const port = process.env.PORT ?? 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error during App initialization", err);
    process.exit(1);
  }
}

bootstrap();
