import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '@/config/app.data.source';
import { TokenType } from '@/shared/enums';
import { MESSAGES } from '@/shared/constants';
import { Request } from 'express';
// import { UserDecoded } from '@/types';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const headers = request.headers;

    try {
      // Extract token from header
      const token = await this.extractToken(headers);
      const storedToken = await this.findTokenInDB(token);

      // Determine secret based on token type
      const secret = this.getSecretByTokenType(storedToken.type);

      // Verify JWT
      const decoded = jwt.verify(token, secret) as UserDecoded;
      if (!decoded) throw new ForbiddenException(MESSAGES.INVALID_TOKEN);

      // Attach user info to request
      (request as any).user = decoded;

      return true;
    } catch (err) {
      console.error('JWT Guard Error:', err);
      throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
    }
  }

  private async extractToken(headers: any): Promise<string> {
    const token = headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException(MESSAGES.AUTHORIZATION_MISSING);
    return token;
  }

  private async findTokenInDB(token: string): Promise<Token> {
    const tokenRepository = AppDataSource.getRepository(Token);
    const storedToken = await tokenRepository.findOne({ where: { token } });

    if (!storedToken)
      throw new ForbiddenException(MESSAGES.INVALID_TOKEN_OR_USED);
    if (storedToken.used)
      throw new ForbiddenException(MESSAGES.INVALID_TOKEN_OR_USED);

    return storedToken;
  }

  private getSecretByTokenType(type: TokenType): string {
    switch (type) {
      case TokenType.ACCESS:
        return process.env.JWT_SECRET!;
      case TokenType.REFRESH:
        return process.env.JWT_REFRESH_SECRET!;
      case TokenType.FORGOTPASSWORD:
        return process.env.JWT_FORGOT_PASSWORD_SECRET!;
      default:
        throw new ForbiddenException(MESSAGES.INVALID_TOKEN);
    }
  }
}
