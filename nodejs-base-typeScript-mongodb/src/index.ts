import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV}` });
import express, { NextFunction, Request, Response } from "express";
import { Database } from "./db/connection";
import { Routes } from "./routes";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.options("*", cors());
Database.init(process.env.DB_URL as string);
Routes.initRoutes(app, 'api/v1');

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send({ errors: [{ message: "Something went wrong" }] });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});


function cookieParser(): any {
  throw new Error('Function not implemented.');
}

