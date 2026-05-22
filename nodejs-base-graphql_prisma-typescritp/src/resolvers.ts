import { userSchema, attendanceSchema } from "../utils/joi.schema";
import {generateToken} from '../utils/jwt.utils'
import bcrypt from "bcrypt";

export const resolvers = {
  Query: {
    users: async (_parent: any, _args: any, context: any) => {
      return await context.models.User.findMany();
    },
    getAttendances: async (_parent: any, args: any, context: any) => {
      try {
        const userId = args.userId;
        const attendances = await context.models.Attendance.findMany({
          where: {
            userId: userId,
          },
        });

        return attendances;
      } catch (error) {
        throw error;
      }
    },
    userPagination: async (_parent: any, args: any, context: any) => {
      try {
        const { skip = 1, take =1  } = args; 
        const users = await context.models.User.findMany({
          skip,
          take,
        });
        return users;
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    createUser: async (_parent: any, args: any, context: any) => {
      try {
        const { value, error } = userSchema.validate(args);

        if (error) {
          throw new Error(
            `Validation error: ${error.details
              .map((x: any) => x.message)
              .join(", ")}`
          );
        }
        const newUser = await context.models.User.create({
          data: {
            user_name: value.username,
            email: value.email,
            password: value.password,
            role : value.role,
          },
        });
        return newUser;
      } catch (error) {
        throw error;
      }
    },
    login: async (_parent: any, args: any, context: any) => {
      try {
        const user = await context.models.User.findUnique({
          where: { email: args.email },
        });
        if (!user) {
          throw new Error("User not found");
        }
        if (typeof args.password !== 'string' || typeof user.password !== 'string') {
          throw new Error("Invalid password");
        }
        const passwordMatch = await bcrypt.compare(
          args.password,
          user.password
        );
        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }
        const token = generateToken(user);
        return { token };
      } catch (error) {
        throw error;
      }
    },
    
    createAttendance: async (_parent: any, args: any, context: any) => {
      try {
        const { value, error } = attendanceSchema.validate(args);

        if (error) {
          throw new Error(
            `Validation error: ${error.details.map((x) => x.message).join(", ")}`
          );
        }

        const newAttendance = await context.models.Attendance.create({
          data: {
            userId: value.userId,
            date: value.date,
            status: value.status,
          },
        });

        return newAttendance;
      } catch (error:any) {
        return error.message;
      }
    },
  },
};
