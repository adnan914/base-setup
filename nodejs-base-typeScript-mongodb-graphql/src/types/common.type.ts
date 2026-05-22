import { Types } from "mongoose";

export interface Response<T> {
  success: boolean;
  message: string | unknown;
  totalCount?: number,
  lastSeenId?: Types.ObjectId,
  data?: T;
}
