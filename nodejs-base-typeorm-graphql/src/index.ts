import 'module-alias/register';
import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV}` });

import cors from "cors";
import helmet from "helmet";
import express, { NextFunction, Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

import bodyParser from 'body-parser';
import path from 'path';

import { initializeDatabase } from "@/config/app.data.source";
import { globalLimiter } from "@/middlewares/rate.limiting.middleware";
import { MessageUtil } from '@/utils';
import { schemaWithMiddleware } from '@/graphql/schema';

async function bootstrap() {
  try {
    // 1️⃣ Database initialization
    await initializeDatabase();
    console.log("Database connected!");

    // 2️⃣ Express app
    const app = express();

    // 3️⃣ Global middlewares
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../public')));
    app.options("*", cors());
    app.use(globalLimiter);

    // 4️⃣ Apollo Server v5
    const server = new ApolloServer({
      schema: schemaWithMiddleware,
      formatError: (err) => {
        return {
          status: false,
          message: err.message,
          field: err.extensions?.field,
        };
      },
    });

    await server.start();

    // 5️⃣ Apply Apollo middleware
    app.use(
      '/graphql',
      bodyParser.json(),
      expressMiddleware(server, {
        context: async ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
      })
    );

    // 6️⃣ Global error handler
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err);
      res.status(500).send({ errors: [{ message: MessageUtil.SOMETHING_WENT_WRONG }] });
    });

    // 7️⃣ Start server
    const port = process.env.PORT ?? 3000;
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}/graphql`);
    });

  } catch (err) {
    console.error("Error during App initialization", err);
    process.exit(1);
  }
}

bootstrap();
