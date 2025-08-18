import { AppDataSource } from "@/config/app.data.source";
import { User } from "@/entities/user.entity";
import { Token } from "@/entities/token.entity";

export const UserRepository = AppDataSource.getRepository(User);
export const TokenRepository = AppDataSource.getRepository(Token);