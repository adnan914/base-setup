import { TokenType } from '@/enums';
import { Request } from 'express';

export interface UserDecoded {
  id: string;
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
  newPassword: string;
}
export interface ForgotPassInput {
  email: string;
}


export interface TokenDocument {
  token: string;
  userId: string;
  type: TokenType;
  createdAt: Date;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}