import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV}` });
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { Database } from "./db/connection";
import { Routes } from "./routes";
import { limiter } from "./middleware/rate.limiting.middleware";
import { ResMessageUtil } from './utils';
import helmet from 'helmet';

const app = express();

// We can apply the rate limiter globally or restrict it to specific routes. 
// Here we are applying the rate limiter to all requests, We can also create custom rate limiting middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(limiter);
app.use(helmet());
app.options("*", cors());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send({ errors: [{ message: ResMessageUtil.SOMETHING_WENT_WRONG }] });
});

Database.init(process.env.DB_URL as string);
Routes.initRoutes(app, 'api/v1');

app.get("/", (req, res) => {
    res.json("Hello, World!");
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
