import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Reflector } from "@nestjs/core";
import * as jwt from "jsonwebtoken";
import { RES_MESSAGES } from "../messages";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import { Token } from "@lib/core/database";
import { TokenType } from "../enums";
import { IS_PUBLIC_KEY } from "../decorators/is.public.decorator";
import { JwtUserPayload, RequestWithUser } from "../types/auth.types";

type RequestHeaders = Request["headers"];

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const headers = request.headers;

    try {
      // Extract token from header
      const token = await this.extractToken(headers);
      const secret = this.configService.get("JWT_ACCESS_SECRET");
      if (!secret) {
        throw new UnauthorizedException(RES_MESSAGES.INVALID_TOKEN);
      }

      // Verify JWT
      const decoded = jwt.verify(token, secret);
      if (!decoded) throw new ForbiddenException(RES_MESSAGES.INVALID_TOKEN);

      if (typeof decoded !== 'object' || decoded === null) {
        throw new ForbiddenException(RES_MESSAGES.INVALID_TOKEN);
      }

      const storedToken = await this.dataSource.getRepository(Token).findOne({
        where: {
          token,
          type: TokenType.ACCESS,
          used: false,
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException(RES_MESSAGES.INVALID_TOKEN_OR_USED);
      }

      // Attach user info to request
      (request as Request & RequestWithUser).user = decoded as JwtUserPayload;

      return true;
    } catch {
      throw new UnauthorizedException(RES_MESSAGES.INVALID_TOKEN);
    }
  }

  private async extractToken(headers: RequestHeaders): Promise<string> {
    const authorizationHeader = headers["authorization"];
    const headerValue = Array.isArray(authorizationHeader)
      ? authorizationHeader[0]
      : authorizationHeader;
    const token = headerValue?.split(" ")[1];
    if (!token)
      throw new UnauthorizedException(RES_MESSAGES.AUTHORIZATION_MISSING);
    return token;
  }
}
