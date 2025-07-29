import 'module-alias/register';
import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV}` });

import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
// import { graphqlUploadExpress } from 'graphql-upload';
import helmet from 'helmet';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
// import http from 'http';
import bodyParser from 'body-parser';
import path from 'path';

import { Database } from '@/db/connection';
import { globalLimiter } from '@/middlewares/rate.limiting.middleware';
import { MessageUtil } from '@/utils';
import { schemaWithMiddleware } from '@/graphql/schema';

const app = express();
// const httpServer = http.createServer(app);

// Connect MongoDB
Database.init(process.env.DB_URL as string);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(helmet());
app.options('*', cors());

// For GraphQL file upload support
// app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

// Apollo Server (GraphQL-only)
const startApolloServer = async () => {
  const server = new ApolloServer({
    // typeDefs,
    // resolvers,
    schema: schemaWithMiddleware,
    formatError: (err) => {
      return {
        status: false,
        message: err.message,
        field: err.extensions?.field
      };
    }
  });

  await server.start();
  app.use('/graphql', bodyParser.json() , globalLimiter, expressMiddleware(server, { context: async ({ req, res }) => ({ req, res }) }));
};

startApolloServer();

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send({ errors: [{ message: MessageUtil.SOMETHING_WENT_WRONG }] });
});

// Start HTTP server
// httpServer.listen(process.env.PORT, () => {
//   console.log(`🚀 GraphQL server ready at http://localhost:${process.env.PORT}/graphql`);
// });

app.listen(process.env.PORT, () => {
  console.log(`🚀 GraphQL server ready at http://localhost:${process.env.PORT}/graphql`);
});