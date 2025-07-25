import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV}` });

import cors from "cors";
import express from "express";
import helmet from 'helmet';
import path from 'path';
import { Database } from "./db/connection";
import { Routes } from "./routes";
import { globalLimiter } from "./middleware/rate.limiting.middleware";
import { globalErrorHandler } from './middleware/error.handler.middleware';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(globalLimiter);
app.use(helmet());
app.options("*", cors());

Database.init(process.env.DB_URL as string);

Routes.initRoutes(app, 'api/v1');

app.get("/", (req, res) => {
    res.json("Hello, World!");
});

app.use(globalErrorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
