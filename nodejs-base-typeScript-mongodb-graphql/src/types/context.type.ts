import { Request, Response } from 'express';
import { UserDecoded } from './auth.type';

export interface GraphQLContext {
  req: Request;
  res: Response;
  user: UserDecoded
}