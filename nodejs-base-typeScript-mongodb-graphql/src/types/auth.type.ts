import { Types } from 'mongoose';
import { TokenType } from '../enums';

export interface UserDecoded {
  _id: string;
  email: string;
  tokenType: TokenType;
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
  userId: Types.ObjectId;
  type: TokenType;
  createdAt: Date;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}