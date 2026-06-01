import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UsersService } from '@lib/users/feature-users';
import { JwtUserPayload, RES_MESSAGES, Status, TokenType } from '@lib/core/common';
import { Token } from '@lib/core/database';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtUserPayload): Promise<JwtUserPayload> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (!token) {
      throw new UnauthorizedException(RES_MESSAGES.AUTHORIZATION_MISSING);
    }

    const storedToken = await this.tokenRepository.findOne({
      where: {
        token,
        type: TokenType.ACCESS,
        used: false,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException(RES_MESSAGES.INVALID_TOKEN_OR_USED);
    }

    const user = await this.usersService.findById(payload.id);

    if (!user || user.status !== Status.ACTIVE) {
      throw new UnauthorizedException(RES_MESSAGES.INVALID_TOKEN_OR_USED);
    }

    return {
      id: user.id,
      email: user.email,
      role:
        typeof payload?.role === 'string'
          ? payload.role
          : typeof user.role?.name === 'string'
            ? user.role.name
            : null,
    };
  }
}
