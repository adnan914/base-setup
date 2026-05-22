import { Types } from 'mongoose';
import { TokenType } from '@/enums';
import { Request } from 'express';

export interface UserDecoded {
  _id: Types.ObjectId;
  email: string;
  tokenType: TokenType;
}

export interface AuthenticatedRequest extends Request {
  user: UserDecoded;
}



// export interface DecodedUser extends Token {
//   userDecoded: UserDecoded;
// }

export interface ResetInput {
  id: Types.ObjectId;
  newPassword: string;

}
export interface ForgotPassInput {
  email: string;
}


export interface TokenDocument {
  token: string;
  userId: Types.ObjectId;
  type: TokenType;
  createdAt: Date;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}