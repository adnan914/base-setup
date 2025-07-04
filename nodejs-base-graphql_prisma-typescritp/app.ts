import express from 'express';
import { createYoga } from 'graphql-yoga';
import { schemaWithMiddleware } from "./src/schema";
import prisma from './prisma/middleware'; 

const app = express();

const yoga = createYoga({
  schema: schemaWithMiddleware,
  context: ({ request }) => {
    const context = {
      ...request,
      prisma, 
      models: {
        User: prisma.user,
        Attendance: prisma.attendance,
      },
    };
    context.headers = request.headers;
    return context;
  },
});

app.use(express.json());
app.use("/graphql", yoga);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
