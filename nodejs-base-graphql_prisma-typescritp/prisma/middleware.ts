import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from 'bcrypt';
import bcryptConfig from '../config/bcrypt.config'

const prisma = new PrismaClient();

prisma.$use(async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
  if (params.model === 'User') {
      if (params.action === 'create') {
          if (params.args.data.password) {
              try {
                  params.args.data.password = await bcrypt.hash(params.args.data.password, bcryptConfig);
              } catch (error) {
                  throw new Error("Password hashing failed");
              }
          } else {
              console.log("Password field is missing or undefined");
          }
      }
  }
  return next(params);
});


export default prisma;
