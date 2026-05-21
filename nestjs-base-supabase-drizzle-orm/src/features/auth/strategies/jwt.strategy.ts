import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/features/users/users.service';
import { Status } from '@/shared/enums';
import { AuthSessionsService } from '../auth-sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private authSessionsService: AuthSessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'access' || !payload.sid) {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findById(payload.sub);

    if (
      !user ||
      user.status !== Status.ACTIVE ||
      !(await this.authSessionsService.isActive(payload.sid, user.id))
    ) {
      throw new UnauthorizedException('Invalid token or user not found');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      sessionId: payload.sid,
    };
  }
}
