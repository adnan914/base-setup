import { Request, Response } from 'express';

export type GraphqlHttpContext = {
  req: Request;
  res: Response;
};
